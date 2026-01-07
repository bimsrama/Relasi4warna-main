# --- Stage 1: Build React App ---
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy package.json & package-lock.json (BUKAN yarn.lock)
# Kita ambil dari folder frontend/
COPY frontend/package*.json ./

# 2. Install Dependencies (Ganti yarn install jadi npm install)
# Gunakan --legacy-peer-deps untuk menghindari konflik versi
RUN npm install --legacy-peer-deps

# 3. FIX ERROR AJV (Penting untuk Craco/Webpack)
RUN npm install ajv@8 --save-dev --legacy-peer-deps

# 4. Copy seluruh source code frontend
COPY frontend/ .

# 5. Build Argument (Untuk menyambungkan ke Backend)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# 6. Build Aplikasi
RUN npm run build

# --- Stage 2: Serve dengan Nginx ---
FROM nginx:alpine

# Copy hasil build ke folder Nginx
# (Asumsi output build ada di folder 'build'. Jika error not found, ganti jadi 'dist')
COPY --from=builder /app/build /usr/share/nginx/html

# Copy config nginx default (jika ada custom config, uncomment baris bawah)
# COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
