# 💡 Outlet Pulsa — Aplikasi Manajemen Transaksi Pulsa

Aplikasi **Outlet Pulsa** adalah sistem manajemen outlet yang digunakan untuk mencatat, mengelola, dan memantau transaksi pulsa serta produk digital.  
Dibangun menggunakan **Express.js** untuk backend API, **Vue.js** untuk frontend SPA, dan **MySQL** sebagai database utama.

---

## 🚀 Teknologi yang Digunakan

| Layer        | Teknologi Utama         | Deskripsi Singkat                            |
|---------------|--------------------------|-----------------------------------------------|
| Frontend      | [Vue.js 3](https://vuejs.org/) | Framework SPA untuk tampilan interaktif       |
| Backend       | [Express.js](https://expressjs.com/) | RESTful API untuk logika bisnis dan data      |
| Database      | [MySQL](https://www.mysql.com/) | Penyimpanan data transaksi dan user           |
| ORM           | [Sequelize](https://sequelize.org/) | Abstraksi ORM untuk komunikasi ke database    |
| Container     | [Docker](https://www.docker.com/) (opsional) | Untuk pengemasan aplikasi client & server     |

---

## 📂 Struktur Proyek

```
project-root/
├── client/               # Frontend (Vue.js)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/               # Backend (Express.js)
│   ├── src/
│   │   ├── models/       # Model Sequelize
│   │   ├── controllers/  # Logika bisnis
│   │   ├── routes/       # Endpoint REST API
│   │   ├── middlewares/  # Middleware (auth, validasi, dll)
│   │   └── config/       # Koneksi DB & konfigurasi lain
│   ├── package.json
│   └── server.js
│
├── docker-compose.yml    # (opsional) Konfigurasi Docker multi-service
└── README.md
```

---

## ⚙️ Instalasi dan Menjalankan Aplikasi

### 1️⃣ Clone Repository
```bash
git clone https://github.com/username/outlet-pulsa.git
cd outlet-pulsa
```

### 2️⃣ Setup Backend (Express.js)
```bash
cd server
npm install
```

Buat file `.env` di folder `server`:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=outlet_pulsa
```

Jalankan server:
```bash
npm start
```

> Server akan berjalan di: [http://localhost:3001](http://localhost:3001)

---

### 3️⃣ Setup Frontend (Vue.js)
```bash
cd ../client
npm install
npm run dev
```

> Aplikasi frontend akan berjalan di: [http://localhost:5173](http://localhost:5173)

---

### 4️⃣ Setup Database (MySQL)
Pastikan MySQL sudah aktif, lalu buat database:
```sql
CREATE DATABASE outlet_pulsa;
```

Kemudian jalankan migrasi Sequelize:
```bash
cd server
npx sequelize db:migrate
```

---

## 🧩 Fitur Utama

- 🔐 Autentikasi dan otorisasi pengguna  
- 💰 Transaksi pulsa, paket data, dan produk digital  
- 🧾 Laporan penjualan dan saldo  
- 🏪 Manajemen outlet dan user  
- ⚙️ API berbasis REST dengan struktur modular  
- 📊 Dashboard interaktif dengan grafik penjualan  

---

## 🐳 Menjalankan dengan Docker (Opsional)

Pastikan Docker & Docker Compose sudah terinstal, lalu jalankan:
```bash
docker-compose up --build
```

Berikut contoh `docker-compose.yml` yang bisa digunakan:
```yaml
version: "3.9"

services:
  mysql:
    image: mysql:8.0
    container_name: outlet_mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: outlet_pulsa
      MYSQL_USER: userapp
      MYSQL_PASSWORD: passapp
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - outlet_network

  server:
    build: ./server
    container_name: outlet_server
    restart: always
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_USER=userapp
      - DB_PASS=passapp
      - DB_NAME=outlet_pulsa
      - PORT=3001
    ports:
      - "3001:3001"
    networks:
      - outlet_network

  client:
    build: ./client
    container_name: outlet_client
    restart: always
    depends_on:
      - server
    ports:
      - "5173:5173"
    networks:
      - outlet_network

volumes:
  mysql_data:

networks:
  outlet_network:
    driver: bridge
```

> Setelah build selesai, buka browser ke:  
> **Frontend:** http://localhost:5173  
> **Backend API:** http://localhost:3001  

---

## 🧠 Kontributor

| Nama | Peran | Kontak |
|------|--------|--------|
| Muammar Kadafi | Fullstack Developer | [GitHub](https://github.com/muammar88) |

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.  
Silakan digunakan, dimodifikasi, dan dikembangkan sesuai kebutuhan.

---

## 🖼️ Cuplikan Tampilan

*(Tambahkan screenshot UI atau dashboard di sini jika ada)*

```
![Dashboard](docs/screenshot-dashboard.png)
![Transaksi](docs/screenshot-transaksi.png)
```

---

## 🛠️ TODO (Pengembangan Selanjutnya)

- [ ] Integrasi WhatsApp Gateway untuk notifikasi transaksi  
- [ ] Fitur top-up otomatis via API penyedia pulsa  
- [ ] Laporan keuangan bulanan otomatis dalam format PDF  

---

> Dibuat dengan ❤️ menggunakan **Express.js + Vue.js + MySQL**
