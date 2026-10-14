#!/bin/sh
set -eu

php artisan config:cache
php artisan migrate --force
php artisan route:cache
chown -R www-data:www-data storage bootstrap/cache
exec apache2-foreground
