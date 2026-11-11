#!/usr/bin/env bash
# USAGE: CF_API_TOKEN=... scripts/ops/carson-rpc-tunnel.sh [--check] [--restart-bchn] [--rotate]
#
# Publishes carson's loopback BCHN RPC to GitHub Actions through a Cloudflare
# Tunnel behind Cloudflare Access, for the refresh-data workflow's UTXO step.
# RPC stays bound to 127.0.0.1. A request needs the Access service token to
# reach bitcoind, and the CI user's RPC password once there.
#
#   Cloudflare (Panmoni account): a service token, a service-token-only Access
#     policy and the Access app first; then the tunnel ingress and its proxied
#     CNAME, so the hostname never answers without Access in front of it.
#   carson: cloudflared from Cloudflare's apt repo, run by a hardened systemd
#     unit as a dynamic user; the tunnel token stays in a root-only file and
#     reaches the process as a systemd credential. An rpcauth line for the CI
#     user, separate from the node's own credentials.
#   GitHub: BCH_RPC_ACCESS_ID / BCH_RPC_ACCESS_SECRET, set the moment the service
#     token is minted, and BCH_RPC_URL, set the moment the rpcauth line lands.
#
# The checks run first and are read-only; the first write happens only after
# all of them pass. --check stops there. The checks read every object the run
# writes, but cannot prove the token may edit them: a scope gap fails at the
# first write, and a re-run picks up where it stopped.
#
# Secrets are minted only when missing. A re-run keeps the service token and
# the CI password, so working CI keeps working. --rotate mints both again and
# needs --restart-bchn, because bitcoind reads rpcauth only at startup.
# --restart-bchn restarts bchn.service and the units that depend on it
# (systemctl list-dependencies --reverse bchn). Without it, a newly written CI
# user starts working at the node's next restart.
#
# Secrets reach curl through -K config on a process substitution, carson over
# ssh stdin, and GitHub over gh stdin. None is printed or put on a command line.
#
# The service token lasts a year. Re-run with --rotate --restart-bchn before
# then; until then, the daily refresh-data run fails with HTTP 401 and emails.
#
# BCHN has no -rpcwhitelist, so the CI user has full RPC. The checks refuse a
# node whose loaded wallets hold a balance.
#
# ENV: CF_API_TOKEN (required): Zone read + DNS edit on the zone; Cloudflare
#        Tunnel edit + Access apps/policies/service tokens edit on the account.
#      ZONE (bchworks.com), RPC_HOST (bchn-rpc.$ZONE), SSH_HOST (carson),
#      GH_REPO (Panmoni/bitcoincashsite-www), CI_RPC_USER (ci_utxo).
{ set +x; } 2>/dev/null # never trace: the trace would print every secret
set -euo pipefail

ZONE="${ZONE:-bchworks.com}"
RPC_HOST="${RPC_HOST:-bchn-rpc.$ZONE}"
SSH_HOST="${SSH_HOST:-carson}"
GH_REPO="${GH_REPO:-Panmoni/bitcoincashsite-www}"
CI_RPC_USER="${CI_RPC_USER:-ci_utxo}"
TUNNEL_NAME="bchn-rpc-carson"
TOKEN_NAME="bitcoincashsite-www CI"
POLICY_NAME="bitcoincashsite-www CI service token only"
APP_NAME="BCHN RPC (carson)"
DATADIR=/var/lib/bchn/.bitcoin
BCHN_CONF=$DATADIR/bitcoin.conf
API=https://api.cloudflare.com/client/v4

CHECK_ONLY=0
RESTART_BCHN=0
ROTATE=0
for arg in "$@"; do
	case "$arg" in
	--check) CHECK_ONLY=1 ;;
	--restart-bchn) RESTART_BCHN=1 ;;
	--rotate) ROTATE=1 ;;
	*)
		echo "unknown argument: $arg" >&2
		exit 2
		;;
	esac
done

say() { printf '%s\n' "$*"; }
die() {
	printf 'FAIL: %s\n' "$*" >&2
	exit 1
}

# cf_raw METHOD PATH [JSON] — prints the whole response; dies on any failure.
cf_raw() {
	local out
	out=$(curl -sS --max-time 60 -X "$1" "$API$2" \
		-K <(printf 'header = "Authorization: Bearer %s"\n' "$CF_API_TOKEN") \
		-H "Content-Type: application/json" \
		${3:+--data "$3"}) || die "Cloudflare $1 $2: curl failed"
	if [ "$(jq -r '.success' <<<"$out" 2>/dev/null)" != true ]; then
		die "Cloudflare $1 $2: $(jq -r '[.errors[]?.message] | join("; ")' <<<"$out" 2>/dev/null || echo 'non-JSON response')"
	fi
	printf '%s\n' "$out"
}
# cf METHOD PATH [JSON] — prints .result.
cf() { cf_raw "$@" | jq -c '.result'; }
# cf_all PATH — GETs a list, every page, and prints one array.
cf_all() {
	local page=1 out all='[]' sep='?'
	[[ $1 == *\?* ]] && sep='&'
	while :; do
		out=$(cf_raw GET "$1${sep}per_page=50&page=$page")
		all=$(jq -c --argjson a "$all" '$a + .result' <<<"$out")
		[ "$page" -ge "$(jq -r '.result_info.total_pages // 1' <<<"$out")" ] && break
		page=$((page + 1))
	done
	printf '%s\n' "$all"
}
gh_secret() { gh secret set "$1" --repo "$GH_REPO"; } # value on stdin

# --- Checks (read-only) ------------------------------------------------------
say "== checks"
[ -n "${CF_API_TOKEN:-}" ] || die "CF_API_TOKEN is not set"
[[ $CI_RPC_USER =~ ^[A-Za-z0-9_]+$ ]] || die "CI_RPC_USER must be letters, digits and _"
[[ $RPC_HOST =~ ^[a-z0-9.-]+$ ]] || die "RPC_HOST is not a hostname"
if [ "$ROTATE" = 1 ] && [ "$RESTART_BCHN" = 0 ]; then
	die "--rotate needs --restart-bchn: the old CI password stops working at once"
fi
for bin in curl jq openssl gh ssh; do
	command -v "$bin" >/dev/null || die "$bin is not installed"
done
gh auth status >/dev/null 2>&1 || die "gh is not logged in"
gh secret list --repo "$GH_REPO" >/dev/null || die "cannot read secrets on $GH_REPO"

zone=$(cf GET "/zones?name=$ZONE")
ZONE_ID=$(jq -r '.[0].id // empty' <<<"$zone")
ACCOUNT_ID=$(jq -r '.[0].account.id // empty' <<<"$zone")
[ -n "$ZONE_ID" ] || die "zone $ZONE is not in this token's account"
say "zone $ZONE ($ZONE_ID), account $ACCOUNT_ID"

TUNNEL_ID=$(cf GET "/accounts/$ACCOUNT_ID/cfd_tunnel?name=$TUNNEL_NAME&is_deleted=false" | jq -r '.[0].id // empty')
dns=$(cf GET "/zones/$ZONE_ID/dns_records?name=$RPC_HOST")
DNS_ID=$(jq -r '.[0].id // empty' <<<"$dns")
DNS_TYPE=$(jq -r '.[0].type // empty' <<<"$dns")
DNS_CONTENT=$(jq -r '.[0].content // empty' <<<"$dns")
TOKEN_ID=$(cf_all "/accounts/$ACCOUNT_ID/access/service_tokens" |
	jq -r --arg n "$TOKEN_NAME" 'map(select(.name == $n))[0].id // empty')
POLICY_ID=$(cf_all "/accounts/$ACCOUNT_ID/access/policies" |
	jq -r --arg n "$POLICY_NAME" 'map(select(.name == $n))[0].id // empty')
APP_ID=$(cf_all "/accounts/$ACCOUNT_ID/access/apps" |
	jq -r --arg d "$RPC_HOST" 'map(select(.domain == $d))[0].id // empty')
if [ -n "$DNS_ID" ]; then
	[ "$DNS_TYPE" = CNAME ] || die "$RPC_HOST already has a $DNS_TYPE record; pick another RPC_HOST"
	if [ -z "$TUNNEL_ID" ] || [ "$DNS_CONTENT" != "$TUNNEL_ID.cfargotunnel.com" ]; then
		die "$RPC_HOST is a CNAME to $DNS_CONTENT, not this tunnel; pick another RPC_HOST"
	fi
fi
say "tunnel ${TUNNEL_ID:-<new>} · dns ${DNS_ID:-<new>} · service token ${TOKEN_ID:-<new>} · policy ${POLICY_ID:-<new>} · app ${APP_ID:-<new>}"

# Quoted heredoc: runs on carson as written; the two values come in as $1, $2.
remote=$(ssh -o BatchMode=yes "$SSH_HOST" "sudo -n bash -s -- $DATADIR $CI_RPC_USER" <<'EOF'
set -euo pipefail
datadir=$1 user=$2 conf=$1/bitcoin.conf
cli() { sudo -u bchn /usr/local/bin/bitcoin-cli -datadir="$datadir" "$@" </dev/null; }
systemctl is-active --quiet bchn && echo "bchn=active" || echo "bchn=inactive"
# RPC must listen on loopback only, on 8332, with nothing set on the command line.
# Read into variables first: grep -q in a pipe can SIGPIPE its writer.
binds=$(grep '^rpcbind=' "$conf" || true)
allows=$(grep '^rpcallowip=' "$conf" || true)
ports=$(grep '^rpcport=' "$conf" || true)
execstart=$(systemctl show -p ExecStart bchn)
if [ -n "$binds" ] && ! grep -qvx 'rpcbind=127.0.0.1' <<<"$binds" &&
	! grep -qvx 'rpcallowip=127.0.0.1' <<<"${allows:-rpcallowip=127.0.0.1}" &&
	! grep -qvx 'rpcport=8332' <<<"${ports:-rpcport=8332}" &&
	! grep -q -- '-rpc' <<<"$execstart"; then
	echo "rpc=loopback-8332"
else
	echo "rpc=other"
fi
grep -q '^\[' "$conf" && echo "sections=yes" || echo "sections=no"
grep -q "^rpcauth=$user:" "$conf" && echo "rpcauth=present" || echo "rpcauth=absent"
# Fail closed: if the wallets cannot be read, funded stays unknown.
funded=unknown
if systemctl is-active --quiet bchn && wallets=$(cli listwallets) &&
	names=$(jq -r '.[]' <<<"$wallets"); then
	funded=no
	while IFS= read -r w; do
		[ -n "$w" ] || [ "$(jq length <<<"$wallets")" -gt 0 ] || continue
		bal=$(cli -rpcwallet="$w" getbalance) || { funded=unknown; break; }
		[ "$(awk -v b="$bal" 'BEGIN { print (b > 0) }')" = 1 ] && funded=yes
	done <<<"$names"
fi
echo "wallet_funded=$funded"
command -v cloudflared >/dev/null && echo "cloudflared=$(cloudflared --version | awk '{print $3}')" || echo "cloudflared=absent"
EOF
) || die "ssh $SSH_HOST checks failed (needs passwordless sudo)"
say "$SSH_HOST: $(tr '\n' ' ' <<<"$remote")"
grep -qx 'bchn=active' <<<"$remote" || die "bchn is not running on $SSH_HOST"
grep -qx 'rpc=loopback-8332' <<<"$remote" || die "$SSH_HOST RPC is not loopback-only on 8332; refusing to tunnel it"
grep -qx 'sections=no' <<<"$remote" || die "$BCHN_CONF has [sections]; an appended rpcauth would land in one"
grep -qx 'wallet_funded=no' <<<"$remote" || die "a loaded wallet on $SSH_HOST holds coins, or its balance could not be read; the CI user would have full RPC over it"

MINT_TOKEN=0
MINT_RPC=0
if [ -z "$TOKEN_ID" ] || [ "$ROTATE" = 1 ]; then MINT_TOKEN=1; fi
if grep -qx 'rpcauth=absent' <<<"$remote" || [ "$ROTATE" = 1 ]; then MINT_RPC=1; fi
say "plan: service token $([ "$MINT_TOKEN" = 1 ] && echo mint || echo keep) · CI password $([ "$MINT_RPC" = 1 ] && echo mint || echo keep) · bchn restart $([ "$RESTART_BCHN" = 1 ] && echo yes || echo no)"

if [ "$CHECK_ONLY" = 1 ]; then
	say "== --check: all checks passed, nothing written"
	exit 0
fi

# --- Cloudflare Access (before anything answers on the hostname) ---------------
say "== cloudflare access"
if [ "$MINT_TOKEN" = 1 ]; then
	# The client secret is returned only at creation or rotation: store it now.
	if [ -z "$TOKEN_ID" ]; then
		token=$(cf POST "/accounts/$ACCOUNT_ID/access/service_tokens" \
			"$(jq -cn --arg n "$TOKEN_NAME" '{name: $n, duration: "8760h"}')")
		TOKEN_ID=$(jq -r '.id' <<<"$token")
		say "service token created: $TOKEN_ID (lasts a year)"
	else
		token=$(cf POST "/accounts/$ACCOUNT_ID/access/service_tokens/$TOKEN_ID/rotate")
		say "service token rotated: $TOKEN_ID"
	fi
	ACCESS_ID=$(jq -r '.client_id // empty' <<<"$token")
	ACCESS_SECRET=$(jq -r '.client_secret // empty' <<<"$token")
	[ -n "$ACCESS_ID" ] || ACCESS_ID=$(cf_all "/accounts/$ACCOUNT_ID/access/service_tokens" |
		jq -r --arg i "$TOKEN_ID" 'map(select(.id == $i))[0].client_id // empty')
	[ -n "$ACCESS_ID" ] || die "no client_id for service token $TOKEN_ID"
	[ -n "$ACCESS_SECRET" ] || die "no client_secret in the service token response"
	printf '%s' "$ACCESS_ID" | gh_secret BCH_RPC_ACCESS_ID
	printf '%s' "$ACCESS_SECRET" | gh_secret BCH_RPC_ACCESS_SECRET
	say "repo secrets set: BCH_RPC_ACCESS_ID, BCH_RPC_ACCESS_SECRET"
fi

policy_body=$(jq -cn --arg n "$POLICY_NAME" --arg t "$TOKEN_ID" \
	'{name: $n, decision: "non_identity", include: [{service_token: {token_id: $t}}]}')
if [ -z "$POLICY_ID" ]; then
	POLICY_ID=$(cf POST "/accounts/$ACCOUNT_ID/access/policies" "$policy_body" | jq -r '.id')
else
	cf PUT "/accounts/$ACCOUNT_ID/access/policies/$POLICY_ID" "$policy_body" >/dev/null
fi
say "access policy: $POLICY_ID (service token $TOKEN_ID only)"

# service_auth_401_redirect: a request without the token gets a 401, not a
# redirect to a login page.
app_body=$(jq -cn --arg n "$APP_NAME" --arg d "$RPC_HOST" --arg p "$POLICY_ID" '{
	name: $n, type: "self_hosted", domain: $d, session_duration: "1h",
	app_launcher_visible: false, service_auth_401_redirect: true,
	policies: [{id: $p, precedence: 1}]}')
if [ -z "$APP_ID" ]; then
	APP_ID=$(cf POST "/accounts/$ACCOUNT_ID/access/apps" "$app_body" | jq -r '.id')
else
	cf PUT "/accounts/$ACCOUNT_ID/access/apps/$APP_ID" "$app_body" >/dev/null
fi
[ -n "$APP_ID" ] && [ "$APP_ID" != null ] || die "the Access app did not come back with an id"
say "access app: $APP_ID on $RPC_HOST"

# --- Cloudflare tunnel + DNS -----------------------------------------------------
say "== cloudflare tunnel"
if [ -z "$TUNNEL_ID" ]; then
	TUNNEL_ID=$(cf POST "/accounts/$ACCOUNT_ID/cfd_tunnel" \
		"$(jq -cn --arg n "$TUNNEL_NAME" '{name: $n, config_src: "cloudflare"}')" | jq -r '.id')
	say "tunnel created: $TUNNEL_ID"
fi
cf PUT "/accounts/$ACCOUNT_ID/cfd_tunnel/$TUNNEL_ID/configurations" "$(jq -cn --arg h "$RPC_HOST" '{config: {ingress: [
	{hostname: $h, service: "http://127.0.0.1:8332"},
	{service: "http_status:404"}]}}')" >/dev/null
say "tunnel ingress: $RPC_HOST -> http://127.0.0.1:8332, everything else 404"
if [ -z "$DNS_ID" ]; then
	cf POST "/zones/$ZONE_ID/dns_records" "$(jq -cn --arg n "$RPC_HOST" --arg c "$TUNNEL_ID.cfargotunnel.com" \
		'{type: "CNAME", name: $n, content: $c, proxied: true, comment: "BCHN RPC tunnel (carson)"}')" >/dev/null
fi
say "dns: $RPC_HOST CNAME $TUNNEL_ID.cfargotunnel.com (proxied)"
TUNNEL_TOKEN=$(cf GET "/accounts/$ACCOUNT_ID/cfd_tunnel/$TUNNEL_ID/token" | jq -r '.')
[[ $TUNNEL_TOKEN =~ ^[A-Za-z0-9+/=_-]{20,}$ ]] || die "the tunnel token response is not a token"

# --- carson: cloudflared -----------------------------------------------------------
say "== $SSH_HOST: cloudflared"
# Unquoted heredoc on purpose: the token expands here, inside single quotes, and
# it matches [A-Za-z0-9+/=_-] (checked above), so it cannot break out of them.
# shellcheck disable=SC2087
ssh -o BatchMode=yes "$SSH_HOST" "sudo -n bash -s" <<EOF
set -euo pipefail
if ! command -v cloudflared >/dev/null; then
	install -d -m 0755 /usr/share/keyrings
	curl -fsSL --proto '=https' https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg </dev/null
	echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' \
		>/etc/apt/sources.list.d/cloudflared.list
	apt-get update -qq </dev/null
	DEBIAN_FRONTEND=noninteractive apt-get install -y -qq cloudflared </dev/null
fi
# The package also links /usr/local/bin/cloudflared to /usr/bin, and that comes
# first on root's PATH: compare the resolved path.
[ "\$(readlink -f "\$(command -v cloudflared)")" = /usr/bin/cloudflared ] || { echo "cloudflared is not the apt one at /usr/bin; the unit runs that path" >&2; exit 1; }
help=\$(cloudflared tunnel run --help 2>&1 </dev/null)
grep -q -- '--token-file' <<<"\$help" || { echo "cloudflared lacks --token-file; upgrade it" >&2; exit 1; }
install -d -m 0700 /etc/cloudflared
( umask 077; printf '%s' '$TUNNEL_TOKEN' >/etc/cloudflared/bchn-rpc.token )
cat >/etc/systemd/system/cloudflared-bchn-rpc.service <<'UNIT'
[Unit]
Description=Cloudflare Tunnel for BCHN RPC (Access-protected, for CI)
After=network-online.target bchn.service
Wants=network-online.target

[Service]
Type=notify
TimeoutStartSec=60
# The token reaches the unprivileged process as a systemd credential (%d).
LoadCredential=token:/etc/cloudflared/bchn-rpc.token
ExecStart=/usr/bin/cloudflared --no-autoupdate tunnel run --token-file %d/token
Restart=on-failure
RestartSec=5s
DynamicUser=yes
NoNewPrivileges=yes
CapabilityBoundingSet=
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectKernelLogs=yes
ProtectControlGroups=yes
ProtectClock=yes
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=yes
RestrictSUIDSGID=yes
LockPersonality=yes

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --quiet cloudflared-bchn-rpc
# Type=notify: restart returns once cloudflared reports a live connection.
if ! systemctl restart cloudflared-bchn-rpc; then
	journalctl -u cloudflared-bchn-rpc -n 30 --no-pager
	exit 1
fi
echo "cloudflared-bchn-rpc: \$(systemctl is-active cloudflared-bchn-rpc)"
EOF

# --- carson: CI RPC user -----------------------------------------------------------
RPC_PASS=
if [ "$MINT_RPC" = 1 ]; then
	say "== $SSH_HOST: rpcauth"
	RPC_PASS=$(openssl rand -hex 32)
	SALT=$(openssl rand -hex 16)
	# Same construction as Bitcoin's share/rpcauth/rpcauth.py: HMAC-SHA256, key = salt.
	RPC_HMAC=$(printf '%s' "$RPC_PASS" | openssl dgst -sha256 -hmac "$SALT" -r | cut -d' ' -f1)
	RPCAUTH="$CI_RPC_USER:$SALT\$$RPC_HMAC"
	# Unquoted heredoc on purpose: RPCAUTH is [A-Za-z0-9_:$] and sits in single quotes.
	# shellcheck disable=SC2087
	ssh -o BatchMode=yes "$SSH_HOST" "sudo -n bash -s" <<EOF
set -euo pipefail
conf=$BCHN_CONF
backup=\$conf.bak-\$(date -u +%Y%m%dT%H%M%SZ)
cp -p "\$conf" "\$backup"
sed -i -e '/^# CI RPC user (bitcoincashsite-www/d' -e '/^rpcauth=$CI_RPC_USER:/d' "\$conf"
[ -z "\$(tail -c1 "\$conf")" ] || echo >>"\$conf"
printf '%s\n' '# CI RPC user (bitcoincashsite-www refresh-data, via the Cloudflare Tunnel)' \
	'rpcauth=$RPCAUTH' >>"\$conf"
chown --reference="\$backup" "\$conf"
chmod --reference="\$backup" "\$conf"
echo "rpcauth: $CI_RPC_USER line written; backup at \$backup. Config diff (salted hash only, no password):"
diff "\$backup" "\$conf" || true
if [ "$RESTART_BCHN" = 1 ]; then
	echo "restarting bchn and its dependents..."
	systemctl restart bchn
	sleep 15
	if ! systemctl is-active --quiet bchn; then
		journalctl -u bchn -n 40 --no-pager
		echo "bchn did not come back; restore with: cp -p \$backup \$conf && systemctl restart bchn" >&2
		exit 1
	fi
	echo "bchn: active"
fi
EOF
	printf '%s' "https://$CI_RPC_USER:$RPC_PASS@$RPC_HOST" | gh_secret BCH_RPC_URL
	say "repo secret set: BCH_RPC_URL"
fi

# --- Verify --------------------------------------------------------------------------
say "== verify"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
rpc_body='{"jsonrpc":"1.0","id":1,"method":"getblockcount","params":[]}'
# probe <curl config lines> — POSTs getblockcount; sets CODE, BITCOIND (yes when
# the answer came from bitcoind, whose 401 carries its jsonrpc realm), HEIGHT.
probe() {
	rm -f "$tmp/head" "$tmp/body" # a failed connect must not reuse the last answer
	CODE=$(curl -s --max-time 20 -o "$tmp/body" -D "$tmp/head" -w '%{http_code}' \
		-X POST --data "$rpc_body" -K <(printf '%s\n' "$1") "https://$RPC_HOST/" || true)
	grep -qi '^www-authenticate: basic realm="jsonrpc"' "$tmp/head" 2>/dev/null && BITCOIND=yes || BITCOIND=no
	HEIGHT=$(jq -r '.result // empty' "$tmp/body" 2>/dev/null || true)
}
# expect_access_refusal <label> <curl config> — Access must answer, not bitcoind.
expect_access_refusal() {
	for _ in $(seq 1 24); do # DNS and the tunnel can take two minutes
		probe "$2"
		[ "$BITCOIND" = yes ] && die "$1: the request reached bitcoind; Access is not enforcing"
		case "$CODE" in 401 | 403)
			say "PASS $1: HTTP $CODE from Access"
			return
			;;
		esac
		sleep 5
	done
	die "$1: expected 401/403 from Access, got HTTP $CODE"
}
expect_access_refusal "without a service token" ''
expect_access_refusal "with a wrong service token" "$(printf 'header = "CF-Access-Client-Id: %s"\nheader = "CF-Access-Client-Secret: wrong"' "${ACCESS_ID:-x.access}")"

if [ "$MINT_TOKEN" = 0 ]; then
	say "service token kept: its secret is not known to this run, so the token checks below are skipped."
	say "== done"
	exit 0
fi
access_cfg=$(printf 'header = "CF-Access-Client-Id: %s"\nheader = "CF-Access-Client-Secret: %s"' "$ACCESS_ID" "$ACCESS_SECRET")
# Through Access with no RPC password: bitcoind itself must answer 401.
for _ in $(seq 1 24); do
	probe "$access_cfg"
	[ "$BITCOIND" = yes ] && break
	sleep 5
done
[ "$BITCOIND" = yes ] || die "with the service token: never reached bitcoind (last HTTP $CODE)"
say "PASS with the service token: the request reaches bitcoind"

[ -n "$RPC_PASS" ] || {
	say "CI password kept: not known to this run, so getblockcount is skipped."
	say "== done"
	exit 0
}
# bitcoind answers -28 while it warms up after a restart: wait up to 30 minutes.
deadline=$(($(date +%s) + 1800))
while :; do
	probe "$access_cfg"$'\n'"user = \"$CI_RPC_USER:$RPC_PASS\""
	if [ -n "$HEIGHT" ]; then
		say "PASS with the service token and CI password: getblockcount = $HEIGHT"
		break
	fi
	if [ "$BITCOIND" = yes ] && [ "$CODE" = 401 ]; then
		if [ "$RESTART_BCHN" = 0 ]; then
			say "PENDING: bitcoind refuses the new CI user until bchn restarts (rpcauth is read at startup)."
			break
		fi
		die "bitcoind refuses the CI user after the restart; check the rpcauth line in $BCHN_CONF"
	fi
	[ "$(date +%s)" -lt "$deadline" ] || die "no getblockcount after 30 min (last HTTP $CODE)"
	sleep 10
done
say "== done"
