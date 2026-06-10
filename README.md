# 💡 Outlet Pulsa — Sistem Manajemen Outlet & Transaksi Produk Digital

**Outlet Pulsa** adalah platform lengkap untuk mengelola outlet pulsa dan produk digital secara end-to-end.  
Sistem ini mencakup **panel administrator** berbasis web, **API backend** yang tangguh, serta **aplikasi mobile** untuk member/agen — memungkinkan pencatatan transaksi, manajemen produk, deposit saldo, hingga cetak struk langsung dari perangkat Android.

Dibangun menggunakan **NestJS** (TypeScript) untuk backend, **Vue.js 3** (TypeScript) untuk frontend web, **Flutter** untuk aplikasi mobile, dan **PostgreSQL** sebagai database utama.

---

## 🚀 Teknologi yang Digunakan

| Layer         | Teknologi Utama                                          | Deskripsi Singkat                                        |
|---------------|----------------------------------------------------------|----------------------------------------------------------|
| Frontend Web  | [Vue.js 3](https://vuejs.org/) + TypeScript              | SPA dengan Vite, TailwindCSS, dan PrimeVue               |
| Backend API   | [NestJS](https://nestjs.com/) + TypeScript               | RESTful API modular dengan Swagger documentation          |
| Database      | [PostgreSQL](https://www.postgresql.org/)                | Database relasional untuk seluruh data transaksional      |
| ORM           | [Prisma](https://www.prisma.io/)                         | Type-safe ORM dengan migration dan seeding                |
| Mobile        | [Flutter](https://flutter.dev/) + Dart                   | Aplikasi Android/iOS untuk member dan agen                |
| Auth          | [Passport.js](http://www.passportjs.org/) + JWT          | Autentikasi berbasis token dengan refresh token           |
| UI Components | [PrimeVue](https://primevue.org/)                        | Komponen UI premium untuk dashboard admin                 |
| Container     | [Docker](https://www.docker.com/) (opsional)             | Containerisasi frontend dengan Dockerfile                 |

---

## 📂 Struktur Proyek

```
outletPulsa/
├── Backend/                  # Backend API (NestJS + TypeScript)
│   ├── src/
│   │   ├── administrator/    # Modul admin (produk, pengguna, transaksi, dll)
│   │   ├── api/              # API publik (auth, beranda, produk, transaksi)
│   │   ├── member/           # Modul member
│   │   ├── common/           # Shared utilities & helpers
│   │   ├── prisma.service.ts # Prisma database service
│   │   ├── app.module.ts     # Root module
│   │   └── main.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Database migrations
│   │   ├── seed.ts           # Seed data
│   │   └── seeds/            # Seed data files
│   ├── .env                  # Environment variables
│   └── package.json
│
├── Frontend/                 # Frontend Web (Vue.js 3 + TypeScript)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── Administrator/  # Panel admin (27+ halaman)
│   │   │   ├── Member/         # Halaman member
│   │   │   └── Public/         # Halaman publik
│   │   ├── components/       # Reusable components
│   │   ├── composables/      # Vue composables
│   │   ├── stores/           # Pinia state management
│   │   ├── router/           # Vue Router
│   │   ├── service/          # API service layer
│   │   └── types/            # TypeScript type definitions
│   ├── Dockerfile            # Production Docker config
│   ├── tailwind.config.js    # TailwindCSS configuration
│   └── package.json
│
├── Mobile/                   # Aplikasi Mobile (Flutter + Dart)
│   ├── lib/                  # Source code Dart
│   ├── android/              # Android platform files
│   ├── ios/                  # iOS platform files
│   ├── assets/               # Gambar & aset aplikasi
│   └── pubspec.yaml          # Flutter dependencies
│
├── *.sql                     # File SQL untuk data referensi
├── resetdb.ps1               # Script reset database (PowerShell)
└── README.md
```

---

## ⚙️ Instalasi dan Menjalankan Aplikasi

### 1️⃣ Clone Repository

```bash
git clone https://github.com/username/outletPulsa.git
cd outletPulsa
```

---

### 2️⃣ Setup Backend (NestJS)

```bash
cd Backend
npm install
```

Buat file `.env` di folder `Backend`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/outletpulsa_db"

PORT=3005
JWT_SECRET=localenv
JWT_EXPIRES=60m

JWT_REFRESH_SECRET=refresh_secret_key
JWT_REFRESH_EXPIRES=7d

NODE_ENV=development

# TRIPAY PAYMENT GATEWAY
TRIPAY_API_KEY=your_api_key
TRIPAY_PRIVATE_KEY=your_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
TRIPAY_MODE=sandbox
```

Jalankan migrasi database dan seed:

```bash
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

> Server akan berjalan di: [http://localhost:3005](http://localhost:3005)  
> Swagger API docs tersedia di: [http://localhost:3005/api](http://localhost:3005/api)

---

### 3️⃣ Setup Frontend (Vue.js 3)

```bash
cd Frontend
npm install
npm run dev
```

> Aplikasi frontend akan berjalan di: [http://localhost:5173](http://localhost:5173)

---

### 4️⃣ Setup Database (PostgreSQL)

Pastikan PostgreSQL sudah terinstal dan aktif, lalu buat database:

```sql
CREATE DATABASE outletpulsa_db;
```

Import data referensi (opsional):

```bash
psql -U postgres -d outletpulsa_db -f kategoris.sql
psql -U postgres -d outletpulsa_db -f operators.sql
psql -U postgres -d outletpulsa_db -f produks.sql
```

> Atau gunakan script `resetdb.ps1` untuk reset dan re-seed database secara otomatis.

---

### 5️⃣ Setup Mobile (Flutter)

```bash
cd Mobile
flutter pub get
flutter run
```

> Pastikan emulator Android/iOS sudah berjalan, atau hubungkan perangkat fisik.

---

## 🧩 Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Login dengan JWT + refresh token
- Role-based access (Administrator, Member, Agen)
- Guard dan middleware otentikasi

### 🏪 Manajemen Administrator
- Dashboard ringkasan dengan grafik penjualan
- Manajemen pengguna, member, dan agen
- Manajemen grup dan hierarki outlet
- Pengaturan umum aplikasi
- Log aktivitas sistem

### 📦 Manajemen Produk
- Produk **prabayar** (pulsa, paket data, token PLN, e-money, dll)
- Produk **pascabayar** (BPJS, PLN, Telkom, PDAM, dll)
- Sinkronisasi produk dari **Digiflazz**, **IAK**, dan **Tripay**
- Kustomisasi harga jual per seller
- Manajemen kategori dan operator

### 💰 Transaksi & Deposit
- Transaksi pulsa dan produk digital real-time
- Deposit saldo via Tripay payment gateway
- Riwayat saldo dan mutasi keuangan
- Cetak struk transaksi (mobile via Bluetooth printer)

### 🔗 Integrasi Pihak Ketiga
- **[Digiflazz](https://digiflazz.com/)** — Provider produk digital (prabayar)
- **[IAK (Indobest Artha Kreasi)](https://iak.id/)** — Provider produk prabayar & pascabayar
- **[Tripay](https://tripay.co.id/)** — Payment gateway untuk deposit dan pembayaran

### 📱 Aplikasi Mobile
- Beranda dengan saldo dan menu produk
- Pembelian produk prabayar & pascabayar
- Riwayat transaksi & deposit
- Cetak struk via Bluetooth thermal printer
- Transfer saldo antar member

---

## 🐳 Menjalankan dengan Docker (Frontend)

Frontend sudah dilengkapi Dockerfile untuk deployment:

```bash
cd Frontend
docker build -t outlet-pulsa-frontend .
docker run -p 5173:80 outlet-pulsa-frontend
```

---

## 🧠 Kontributor

| Nama             | Peran              | Kontak                                          |
|------------------|--------------------|-------------------------------------------------|
| Muammar Kadafi   | Fullstack Developer | [GitHub](https://github.com/muammar88)          |

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.  
Silakan digunakan, dimodifikasi, dan dikembangkan sesuai kebutuhan.

---

## 🖼️ Cuplikan Tampilan

*(Tambahkan screenshot UI atau dashboard di sini)*

```
![Dashboard Admin](docs/screenshot-dashboard.png)
![Transaksi](docs/screenshot-transaksi.png)
![Mobile App](docs/screenshot-mobile.png)
```

---

## 🛠️ TODO (Pengembangan Selanjutnya)

- [ ] Integrasi WhatsApp Gateway untuk notifikasi transaksi
- [ ] Laporan keuangan bulanan otomatis dalam format PDF
- [ ] Push notification di aplikasi mobile
- [ ] Fitur multi-outlet untuk satu akun

---

> Dibuat dengan ❤️ menggunakan **NestJS + Vue.js 3 + Flutter + PostgreSQL**
