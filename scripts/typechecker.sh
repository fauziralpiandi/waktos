#!/bin/bash

GREEN="\033[1;32m"
RESET="\033[0m"

spin() {
  local -a spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  while kill -0 "$1" 2>/dev/null; do
    printf "\r%s Type-checking... " "${spinner[i]}"
    i=$(( (i + 1) % ${#spinner[@]} ))
    sleep 0.1
  done
}

tsc --noEmit --pretty false &
pid=$!

spin "$pid"
wait "$pid"

exit_code=$?

printf "\r\033[K"

if [ $exit_code -eq 0 ]; then
  echo -e "${GREEN}✓ Type-check passed!${RESET}"
fi

exit $exit_code
