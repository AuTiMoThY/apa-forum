FROM php:8.2-apache

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    curl \
    git \
    zip \
    unzip \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 安裝 PHP 擴展
RUN docker-php-ext-install \
    mysqli \
    pdo \
    pdo_mysql \
    opcache \
    zip \
    intl

# 安裝 GD 擴展（圖片處理）
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd

# 安裝 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 啟用 Apache mod_rewrite（CodeIgniter 需要）
RUN a2enmod rewrite

# 設定 Apache 配置
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf
RUN sed -i 's|<Directory /var/www/html>|<Directory /var/www/html/public>|g' /etc/apache2/sites-available/000-default.conf
RUN sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/sites-available/000-default.conf

# 複製 PHP 配置檔案
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# 直接使用 repo 裡的 entrypoint（確保你改的內容一定生效）
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
# 若 entrypoint.sh 由 Windows 編輯可能含 CRLF，移除 \r 避免 exec ENOENT
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

# 設定工作目錄
WORKDIR /var/www/html

# 設定權限
#
# 注意：uploads 可能有大量圖片，避免在 build 時處理 uploads（uploads 在 runtime 由 bind mount 提供）。
RUN mkdir -p /var/www/html/writable \
    && chown -R www-data:www-data /var/www/html/writable \
    && chmod -R 755 /var/www/html/writable

# 暴露端口
EXPOSE 80

# 設定 entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# 啟動 Apache
CMD ["apache2-foreground"]
