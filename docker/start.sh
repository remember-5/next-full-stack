#!/bin/sh

set -eu

require_env() {
  var_name="$1"
  eval "var_value=\${$var_name:-}"

  if [ -z "$var_value" ]; then
    echo "required environment variable '$var_name' is not set" >&2
    exit 1
  fi
}

require_env "BETTER_AUTH_URL"
require_env "BETTER_AUTH_SECRET"

exec bun server.js
