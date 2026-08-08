#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is ready"

# ⚠️  TEMPORARY — ONE DEPLOY ONLY. REVERT TO `npx prisma db push` IMMEDIATELY AFTER.
# --force-reset DROPS THE ENTIRE DATABASE and recreates it from the schema.
echo "Running prisma db push (FORCE RESET — data will be destroyed)..."
npx prisma db push --force-reset

# Safe to run on every boot: the seed is idempotent.
echo "Running prisma db seed..."
npx prisma db seed

echo "Starting application..."
exec npm run start:prod
