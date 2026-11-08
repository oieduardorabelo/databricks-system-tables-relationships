#!/usr/bin/env bash
# Export the system catalog table definitions from a Databricks workspace.
#
# Usage: scripts/export-system-tables.sh <databricks-cli-profile>
#
# The raw export goes to scripts/.uc-export/ (Git ignores it, because it has
# workspace details such as metastore IDs and storage paths).
# Then run scripts/build-columns.py to write columns.js.
set -euo pipefail

profile="${1:?Give a Databricks CLI profile, for example: scripts/export-system-tables.sh aws}"
out="$(dirname "$0")/.uc-export"
mkdir -p "$out"
rm -f "$out"/*.json

schemas=$(databricks schemas list system -p "$profile" -o json | python3 -c 'import sys, json; print(" ".join(s["name"] for s in json.load(sys.stdin)))')
for schema in $schemas; do
  databricks tables list system "$schema" -p "$profile" -o json > "$out/$schema.json"
  echo "system.$schema: $(python3 -c 'import sys, json; print(len(json.load(open(sys.argv[1]))))' "$out/$schema.json") tables"
done
