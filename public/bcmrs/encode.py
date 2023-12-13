#!/usr/bin/env python3.10

# encode.py

import argparse


def utf8_to_hex(input_string):
    # -x
    """ Convert UTF-8 string to hexadecimal representation """
    return input_string.encode().hex()


def hex_to_utf8(input_string):
    # -u
    """ Convert hexadecimal string to UTF-8 representation """
    return bytes.fromhex(input_string).decode('utf-8')


def string_bytes(input_string, is_hex):
    """ Get the byte length of the input string. If is_hex is True, treats the string as hexadecimal. """
    if is_hex:
        # Hexadecimal strings represent bytes, so each pair of characters is a byte
        return len(input_string) // 2
    else:
        # UTF-8 string, directly get the byte length
        return len(input_string.encode())


# Set up the argument parser
parser = argparse.ArgumentParser(
    description='Convert between UTF-8 and Hexadecimal, and calculate byte length.')

# Adding arguments
parser.add_argument('input', help='Input string to be converted or evaluated')
parser.add_argument('-x', '--tohex', action='store_true',
                    help='Convert UTF-8 to Hexadecimal')
parser.add_argument('-u', '--toutf8', action='store_true',
                    help='Convert Hexadecimal to UTF-8')
parser.add_argument('-b', '--bytes', action='store_true',
                    help='Get byte length of the input string')
parser.add_argument('--ishex', action='store_true',
                    help='Indicate if the input string is hexadecimal (used with -b)')

# Parse arguments
args = parser.parse_args()

# Perform conversion based on the flags
if args.tohex:
    print(utf8_to_hex(args.input))
elif args.toutf8:
    print(hex_to_utf8(args.input))
elif args.bytes:
    print(string_bytes(args.input, args.ishex))
else:
    print("No valid conversion flag provided. Use -x for UTF-8 to Hex, -u for Hex to UTF-8, or -b for byte length.")
