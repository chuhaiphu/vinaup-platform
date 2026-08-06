#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is ready"

# `db push` WITHOUT --force-reset: it reconciles the schema and keeps the data.
echo "Running prisma db push..."
npx prisma db push

# Safe to run on every boot: the seed is idempotent.
echo "Running prisma db seed..."
npx prisma db seed

echo "Starting application..."
exec npm run start:prod
