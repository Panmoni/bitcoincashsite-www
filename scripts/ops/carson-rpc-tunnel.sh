#!/usr/bin/env bash
# USAGE: CF_API_TOKEN=... scripts/ops/carson-rpc-tunnel.sh [--check] [--restart-bchn]
#
# Publishes carson's loopback BCHN RPC to GitHub Actions through a Cloudflare
# Tunnel behind Cloudflare Access, for the refresh-data workflow's UTXO step.
# RPC stays bound to 127.0.0.1; the only way in is the Access service token.
#
#   Cloudflare (Panmoni account): tunnel + ingress, proxied CNAME, a service
#     token, a service-token-only Access policy, and the Access app.
#   carson: cloudflared from Cloudflare's apt repo, a systemd unit reading the
#     tunnel token from a root-only file (passed to an
#     unprivileged process as a systemd credential), and an rpcauth line for the CI user,
#     separate from the node's local credentials.
#   GitHub: BCH_RPC_URL, BCH_RPC_ACCESS_ID, BCH_RPC_ACCESS_SECRET repo secrets.
#
# Every run checks everything first and writes nothing until all checks pass.
# --check stops after the checks. A full run is safe to repeat: it rotates the
# CI RPC password and the service-token secret, and re-sets the repo secrets.
#
# bitcoind reads rpcauth only at startup. --restart-bchn restarts bchn.service
# (and the units that require it) so the new CI user works at once; without it,
# the CI user starts working at the node's next restart.
#
# Secrets go to carson over ssh stdin and to GitHub over gh stdin. None is
# printed, passed on a command line, or written outside carson's root-only files.
#
# ENV: CF_API_TOKEN (required): Zone read + DNS edit on the zone; Cloudflare
#        Tunnel edit + Access apps/policies/service tokens edit on the account.
#      ZONE (bchworks.com), RPC_HOST (bchn-rpc.$ZONE), SSH_HOST (carson),
#      GH_REPO (Panmoni/bitcoincashsite-www), CI_RPC_USER (ci_utxo).
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
BCHN_CONF=/var/lib/bchn/.bitcoin/bitcoin.conf
API=https://api.cloudflare.com/client/v4

CHECK_ONLY=0
RESTART_BCHN=0
for arg in "$@"; do
	case "$arg" in
	--check) CHECK_ONLY=1 ;;
	--restart-bchn) RESTART_BCHN=1 ;;
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

# cf METHOD PATH [JSON] — prints .result; dies with Cloudflare's own errors.
cf() {
	local out
	out=$(curl -sS -X "$1" "$API$2" \
		-H "Authorization: Bearer $CF_API_TOKEN" \
		-H "Content-Type: application/json" \
		${3:+--data "$3"}) || die "Cloudflare $1 $2: curl failed"
	if [ "$(jq -r '.success' <<<"$out" 2>/dev/null)" != true ]; then
		die "Cloudflare $1 $2: $(jq -c '.errors // .' <<<"$out" 2>/dev/null || printf '%s' "$out" | head -c 300)"
	fi
	jq -c '.result' <<<"$out"
}

# --- Checks (read-only) ------------------------------------------------------
say "== checks"
[ -n "${CF_API_TOKEN:-}" ] || die "CF_API_TOKEN is not set"
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
TOKEN_ID=$(cf GET "/accounts/$ACCOUNT_ID/access/service_tokens" |
	jq -r --arg n "$TOKEN_NAME" 'map(select(.name == $n))[0].id // empty')
POLICY_ID=$(cf GET "/accounts/$ACCOUNT_ID/access/policies" |
	jq -r --arg n "$POLICY_NAME" 'map(select(.name == $n))[0].id // empty')
APP_ID=$(cf GET "/accounts/$ACCOUNT_ID/access/apps" |
	jq -r --arg d "$RPC_HOST" 'map(select(.domain == $d))[0].id // empty')
if [ -n "$DNS_ID" ] && [ "$DNS_TYPE" != CNAME ]; then
	die "$RPC_HOST already has a $DNS_TYPE record; remove it or pick another RPC_HOST"
fi
say "tunnel ${TUNNEL_ID:-<new>} · dns ${DNS_ID:-<new>} · service token ${TOKEN_ID:-<new>} · policy ${POLICY_ID:-<new>} · app ${APP_ID:-<new>}"

# shellcheck disable=SC2087 # local values expand into the remote script on purpose
remote=$(ssh -o BatchMode=yes "$SSH_HOST" "sudo -n bash -s" <<EOF
set -e
systemctl is-active --quiet bchn && echo "bchn=active" || echo "bchn=inactive"
grep -qE '^rpcbind=127\.0\.0\.1$' $BCHN_CONF && echo "rpcbind=loopback" || echo "rpcbind=other"
grep -q '^rpcauth=$CI_RPC_USER:' $BCHN_CONF && echo "rpcauth=present" || echo "rpcauth=absent"
command -v cloudflared >/dev/null && echo "cloudflared=\$(cloudflared --version | awk '{print \$3}')" || echo "cloudflared=absent"
EOF
) || die "ssh $SSH_HOST (needs passwordless sudo) failed"
say "$SSH_HOST: $(tr '\n' ' ' <<<"$remote")"
grep -q '^rpcbind=loopback$' <<<"$remote" || die "$SSH_HOST BCHN RPC is not bound to 127.0.0.1 only; refusing to tunnel it"

if [ "$CHECK_ONLY" = 1 ]; then
	say "== --check: all checks passed, nothing written"
	exit 0
fi

# --- Cloudflare ----------------------------------------------------------------
say "== cloudflare"
if [ -z "$TUNNEL_ID" ]; then
	TUNNEL_ID=$(cf POST "/accounts/$ACCOUNT_ID/cfd_tunnel" \
		"$(jq -cn --arg n "$TUNNEL_NAME" '{name: $n, config_src: "cloudflare"}')" | jq -r '.id')
	say "tunnel created: $TUNNEL_ID"
fi
cf PUT "/accounts/$ACCOUNT_ID/cfd_tunnel/$TUNNEL_ID/configurations" "$(jq -cn --arg h "$RPC_HOST" '{config: {ingress: [
	{hostname: $h, service: "http://127.0.0.1:8332"},
	{service: "http_status:404"}]}}')" >/dev/null
say "tunnel ingress: $RPC_HOST -> http://127.0.0.1:8332, everything else 404"

dns_body=$(jq -cn --arg n "$RPC_HOST" --arg c "$TUNNEL_ID.cfargotunnel.com" \
	'{type: "CNAME", name: $n, content: $c, proxied: true, comment: "BCHN RPC tunnel (carson)"}')
if [ -z "$DNS_ID" ]; then
	cf POST "/zones/$ZONE_ID/dns_records" "$dns_body" >/dev/null
else
	cf PUT "/zones/$ZONE_ID/dns_records/$DNS_ID" "$dns_body" >/dev/null
fi
say "dns: $RPC_HOST CNAME $TUNNEL_ID.cfargotunnel.com (proxied)"

# The client secret is returned only at creation or rotation.
if [ -z "$TOKEN_ID" ]; then
	token=$(cf POST "/accounts/$ACCOUNT_ID/access/service_tokens" \
		"$(jq -cn --arg n "$TOKEN_NAME" '{name: $n, duration: "8760h"}')")
	TOKEN_ID=$(jq -r '.id' <<<"$token")
	say "service token created: $TOKEN_ID (expires in a year)"
else
	token=$(cf POST "/accounts/$ACCOUNT_ID/access/service_tokens/$TOKEN_ID/rotate")
	say "service token rotated: $TOKEN_ID"
fi
ACCESS_ID=$(jq -r '.client_id' <<<"$token")
ACCESS_SECRET=$(jq -r '.client_secret' <<<"$token")
[ -n "$ACCESS_ID" ] && [ "$ACCESS_ID" != null ] || die "service token response had no client_id"
[ -n "$ACCESS_SECRET" ] && [ "$ACCESS_SECRET" != null ] || die "service token response had no client_secret"

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
	name: $n, type: "self_hosted", domain: $d, session_duration: "24h",
	app_launcher_visible: false, service_auth_401_redirect: true,
	policies: [{id: $p, precedence: 1}]}')
if [ -z "$APP_ID" ]; then
	APP_ID=$(cf POST "/accounts/$ACCOUNT_ID/access/apps" "$app_body" | jq -r '.id')
else
	cf PUT "/accounts/$ACCOUNT_ID/access/apps/$APP_ID" "$app_body" >/dev/null
fi
say "access app: $APP_ID on $RPC_HOST"

TUNNEL_TOKEN=$(cf GET "/accounts/$ACCOUNT_ID/cfd_tunnel/$TUNNEL_ID/token" | jq -r '.')

# --- carson --------------------------------------------------------------------
say "== $SSH_HOST"
RPC_PASS=$(openssl rand -hex 32)
SALT=$(openssl rand -hex 16)
# Same construction as Bitcoin's share/rpcauth/rpcauth.py: HMAC-SHA256, key = salt.
RPC_HMAC=$(printf '%s' "$RPC_PASS" | openssl dgst -sha256 -hmac "$SALT" -r | cut -d' ' -f1)
RPCAUTH="$CI_RPC_USER:$SALT\$$RPC_HMAC"

# shellcheck disable=SC2087 # local values expand into the remote script on purpose
ssh -o BatchMode=yes "$SSH_HOST" "sudo -n bash -s" <<EOF
set -euo pipefail
if ! command -v cloudflared >/dev/null; then
	install -d -m 0755 /usr/share/keyrings
	curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg
	echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' \
		>/etc/apt/sources.list.d/cloudflared.list
	apt-get update -qq
	DEBIAN_FRONTEND=noninteractive apt-get install -y -qq cloudflared
fi
echo "cloudflared \$(cloudflared --version | awk '{print \$3}')"

install -d -m 0700 /etc/cloudflared
umask 077
printf '%s' '$TUNNEL_TOKEN' >/etc/cloudflared/bchn-rpc.token
chmod 0600 /etc/cloudflared/bchn-rpc.token
cat >/etc/systemd/system/cloudflared-bchn-rpc.service <<'UNIT'
[Unit]
Description=Cloudflare Tunnel for BCHN RPC (Access-protected, for CI)
After=network-online.target bchn.service
Wants=network-online.target

[Service]
# The token reaches the unprivileged process as a systemd credential (%d).
LoadCredential=token:/etc/cloudflared/bchn-rpc.token
ExecStart=/usr/bin/cloudflared --no-autoupdate tunnel run --token-file %d/token
Restart=on-failure
RestartSec=5s
DynamicUser=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --quiet cloudflared-bchn-rpc
systemctl restart cloudflared-bchn-rpc
echo "cloudflared-bchn-rpc: \$(systemctl is-active cloudflared-bchn-rpc)"

cp -p $BCHN_CONF $BCHN_CONF.bak-\$(date -u +%Y%m%dT%H%M%SZ)
sed -i -e '/^# CI RPC user (bitcoincashsite-www/d' -e '/^rpcauth=$CI_RPC_USER:/d' $BCHN_CONF
printf '%s\n' '# CI RPC user (bitcoincashsite-www refresh-data, via the Cloudflare Tunnel)' \
	'rpcauth=$RPCAUTH' >>$BCHN_CONF
chown bchn:bchn $BCHN_CONF
chmod 0600 $BCHN_CONF
echo "rpcauth: $CI_RPC_USER line written (old line, if any, replaced; backup beside the file)"

if [ "$RESTART_BCHN" = 1 ]; then
	echo "restarting bchn..."
	systemctl restart bchn
fi
EOF

# --- GitHub ------------------------------------------------------------------------
say "== github"
printf '%s' "https://$CI_RPC_USER:$RPC_PASS@$RPC_HOST" | gh secret set BCH_RPC_URL --repo "$GH_REPO"
printf '%s' "$ACCESS_ID" | gh secret set BCH_RPC_ACCESS_ID --repo "$GH_REPO"
printf '%s' "$ACCESS_SECRET" | gh secret set BCH_RPC_ACCESS_SECRET --repo "$GH_REPO"
say "repo secrets set on $GH_REPO: BCH_RPC_URL, BCH_RPC_ACCESS_ID, BCH_RPC_ACCESS_SECRET"

# --- Verify --------------------------------------------------------------------------
say "== verify"
rpc_body='{"jsonrpc":"1.0","id":1,"method":"getblockcount","params":[]}'
# DNS and the tunnel connection can take a minute to come up.
code=000
for _ in $(seq 1 24); do
	code=$(curl -s -o /dev/null -w '%{http_code}' -X POST --data "$rpc_body" "https://$RPC_HOST/" || true)
	case "$code" in 401 | 403) break ;; esac
	sleep 5
done
case "$code" in
401 | 403) say "PASS without the service token: HTTP $code" ;;
*) die "without the service token: expected 401/403, got HTTP $code" ;;
esac

# bitcoind answers -28 while it warms up after a restart: wait up to 30 minutes.
deadline=$(($(date +%s) + 1800))
while :; do
	resp=$(curl -s -w '\n%{http_code}' -X POST --data "$rpc_body" \
		-u "$CI_RPC_USER:$RPC_PASS" \
		-H "CF-Access-Client-Id: $ACCESS_ID" -H "CF-Access-Client-Secret: $ACCESS_SECRET" \
		"https://$RPC_HOST/" || true)
	code=${resp##*$'\n'}
	height=$(jq -r '.result // empty' <<<"${resp%$'\n'*}" 2>/dev/null || true)
	if [ -n "$height" ]; then
		say "PASS with the service token: getblockcount = $height"
		break
	fi
	if [ "$code" = 401 ] && [ "$RESTART_BCHN" = 0 ]; then
		say "PENDING with the service token: the tunnel answers, bitcoind refuses the CI user (HTTP 401)."
		say "        The rpcauth line is in place; it takes effect when bchn next restarts."
		break
	fi
	[ "$(date +%s)" -lt "$deadline" ] || die "with the service token: no getblockcount after 30 min (last HTTP $code)"
	sleep 10
done
say "== done"
