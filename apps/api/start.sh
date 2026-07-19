#!/bin/sh

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Running prisma db push..."
npx prisma db push --force-reset

if [ $? -eq 0 ]; then
  echo "Prisma db push successful!"
else
  echo "Prisma db push failed!"
  exit 1
fi

echo "Running prisma db seed..."
npx prisma db seed

if [ $? -eq 0 ]; then
  echo "Prisma db seed successful!"
else
  echo "Prisma db seed failed!"
  exit 1
fi

echo "Starting application..."
exec npm run start:prod