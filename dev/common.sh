#!/usr/bin/env bash

function abspath() {
    cd "$(dirname "$1")"
    printf "%s/%s\n" "$(pwd)" "$(basename "$1")"
    cd "$OLDPWD"
}
