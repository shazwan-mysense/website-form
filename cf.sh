#!/bin/sh
# Runs wrangler for this project using the portable Node in the Claude scratchpad.
# There is no Node installed on this Mac, so both live under /private/tmp/claude-501/...
# and a reboot or cleanup can remove them. If this script says it cannot find them,
# ask Claude to download Node 22 and wrangler into the scratchpad again.
set -e
TOOLS=""
for d in /private/tmp/claude-501/-Users-mysense-Desktop/*/scratchpad/tools; do
  [ -d "$d/wr/node_modules/wrangler" ] && TOOLS="$d"
done
if [ -z "$TOOLS" ]; then
  echo "Portable Node + wrangler are not in the scratchpad any more."
  echo "Ask Claude to put them back, then run this again."
  exit 1
fi
NODE=$(ls -d "$TOOLS"/node-v*/bin | head -1)
export PATH="$NODE:$PATH"
export WRANGLER_SEND_METRICS=false
cd "$(dirname "$0")"
exec node "$TOOLS/wr/node_modules/wrangler/bin/wrangler.js" "$@"
