#!/bin/sh
set -e

# cron jobs don't inherit the container's environment, so snapshot it for them.
export -p > /app/.cron-env

crond -b -l 8

exec "$@"
