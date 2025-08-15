#!/bin/bash

GREEN="\033[1;32m"
RESET="\033[0m"

spin() {
  local -a spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  while kill -0 "$1" 2>/dev/null; do
    printf "\r%s Building... " "${spinner[i]}"
    i=$(( (i + 1) % ${#spinner[@]} ))
    sleep 0.1
  done
}

tsup --silent &
pid=$!

spin "$pid"
wait "$pid"
exit_code=$?

printf "\r\033[K"

if [ $exit_code -ne 0 ]; then
  exit $exit_code
fi

node scripts/bundle-analyzer.js
# cd demo && npm i .. >/dev/null 2>&1

echo -e "${GREEN}✓ Build complete!${RESET}"
exit 0
