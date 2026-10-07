#!/usr/bin/env sh
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js 22.5+ لازم است: https://nodejs.org"; exit 1; }
node scripts/restore.js || exit 1
exec node --experimental-sqlite --no-warnings server.js "$@"
