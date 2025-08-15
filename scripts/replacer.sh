#!/bin/bash

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <from> <to>"
  exit 1
fi

FROM="$1"
TO="$2"

find ./src \
  -type f \( -name "*.ts" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | while read -r file; do
    if grep -q "$FROM" "$file"; then
      sed -i.bak "s/$FROM/$TO/g" "$file" && rm "${file}.bak"
      echo "✓ $file"
    fi
  done

echo "🪄 Replaced all occurrences of '$FROM' → '$TO'"
