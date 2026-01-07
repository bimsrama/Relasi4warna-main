# --- Tahap 1: Build React App (Node.js) ---
FROM node:18-alpine AS build

# Set folder kerja di dalam container
WORKDIR /app

# 1. Copy file package.json DARI folder frontend
# (Penting: Kita ambil dari dalam folder frontend)
COPY frontend/package*.json ./

# 2. Install Dependencies
# Menggunakan --legacy-peer-deps untuk mengatasi konflik versi react-day-picker/date-fns
RUN npm install --legacy-peer-deps

# 3. FIX ERROR "Cannot find module ajv":
# Kita install manual library ajv versi 8 agar Craco/Webpack tidak error saat build
RUN npm install ajv@8 --save-dev --legacy-peer-deps

# 4. Copy SELURUH kodingan dari folder frontend
COPY frontend/ .

# 5. Build aplikasi menjadi file HTML/CSS/JS statis
RUN npm run build

# --- Tahap 2: Menjalankan Website (Nginx) ---
FROM nginx:alpine

# 6. Copy hasil build React tadi ke folder Nginx agar bisa dibuka browser
# Catatan: Jika nanti error "not found", ubah /app/build menjadi /app/dist (tergantung pakai Vite/CRA)
COPY --from=build /app/build /usr/share/nginx/html

# 7. Copy konfigurasi Nginx (Opsional, gunakan default jika file nginx.conf tidak ada)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 8. Buka Port 80
EXPOSE 80

# 9. Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
