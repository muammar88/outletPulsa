# # Mematikan docker container
# Write-Host "Mematikan docker container"
# docker down -v

# # Menjalankan docker compose dev dan build
# Write-Host "Menjalankan docker compose mode dev dan melakukan build"
# docker compose -f docker-compose.dev.yml up -d --build

# Masuk ke serve
Write-Host " Masuk ke folder server..."
cd server

# Menghapus database
Write-Host " Menghapus Database..."
& "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root -e "DROP DATABASE IF EXISTS outletpulsa; CREATE DATABASE outletpulsa;"

# Jalankan migrasi Sequelize
Write-Host "🚀 Running Sequelize migrations..."
npx sequelize-cli db:migrate

# # Jalankan seeder Sequelize
Write-Host "🌱 Seeding database..."
npx sequelize-cli db:seed:all

Write-Host "✅ Done!"
cd ../.
