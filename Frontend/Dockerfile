# ========================
# Build Stage
# ========================
FROM node:lts-alpine AS build-stage

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Add build arguments and environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy source code and build
COPY . .
RUN npm run build

# ========================
# Production Stage
# ========================
FROM httpd:2.4-alpine AS production-stage

# Copy built files to Apache's public folder
COPY --from=build-stage /app/dist/ /usr/local/apache2/htdocs/

# Copy .htaccess if exists
COPY ./config/.htaccess /usr/local/apache2/htdocs/.htaccess

# Enable .htaccess, mod_rewrite, mod_deflate, and mod_filter
RUN sed -i '/<Directory "\/usr\/local\/apache2\/htdocs">/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /usr/local/apache2/conf/httpd.conf \
 && sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/' /usr/local/apache2/conf/httpd.conf \
 && sed -i 's/#LoadModule deflate_module/LoadModule deflate_module/' /usr/local/apache2/conf/httpd.conf \
 && sed -i 's/#LoadModule filter_module/LoadModule filter_module/' /usr/local/apache2/conf/httpd.conf

# Expose port
EXPOSE 80

# Start Apache in foreground
CMD ["httpd-foreground"]
