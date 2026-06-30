#!/bin/sh
set -e

echo "Deploying database migrations / schema push..."

# Wait for the database to be ready and retry prisma db push
RETRIES=5
until prisma db push --skip-generate; do
  echo "Database not ready or push failed, retrying in 3 seconds... ($RETRIES retries left)"
  RETRIES=$((RETRIES-1))
  if [ "$RETRIES" -eq 0 ]; then
    echo "Failed to connect to database or push schema"
    exit 1
  fi
  sleep 3
done

echo "Starting Next.js application..."
exec "$@"
