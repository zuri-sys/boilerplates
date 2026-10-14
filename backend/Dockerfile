FROM php:8.4-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
    libicu-dev libpq-dev libzip-dev libonig-dev libsqlite3-dev unzip git \
    && docker-php-ext-install bcmath intl mbstring pdo_pgsql pdo_sqlite zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /var/www/html
COPY . .
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf \
    && composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x render-start.sh

EXPOSE 80
CMD ["sh", "render-start.sh"]
