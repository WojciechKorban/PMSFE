#!/bin/sh
set -e
envsubst '${API_URL} ${DEFAULT_LANGUAGE}' \
  < /etc/nginx/templates/env.js.template \
  > /usr/share/nginx/html/env.js
exec "$@"
