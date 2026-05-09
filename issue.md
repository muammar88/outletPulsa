# Planning Implementasi: Migrasi Model Sequelize ke Schema Prisma

**Tujuan:** Mengonversi 43 model database dari aplikasi lama yang menggunakan Sequelize (di `D:\PROJECT\NODEJS\outletpulsa_lama\db\models`) ke format skema Prisma (`schema.prisma`) pada backend NestJS yang baru.

---

## 🛠️ Tahapan Implementasi

Untuk memastikan konversi berjalan 100% akurat tanpa *error* dan *typo*, kita memiliki dua pendekatan. **Pendekatan A sangat disarankan** karena jauh lebih aman dan cepat untuk dipraktikkan oleh Junior Programmer maupun AI.

### Tahap 1: Setup Koneksi Database (Wajib)
Sebelum melakukan apa pun, kita harus menghubungkan Prisma dengan database.
1. Buka file `.env` di folder `Backend`.
2. Tambahkan URL koneksi database lama (atau database lokal tempat tabel Sequelize berada):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/nama_database_lama?schema=public"
   ```
3. Buka `prisma/schema.prisma` dan pastikan `provider` dikonfigurasi ke `"postgresql"`.

---

### Tahap 2 (OPSI A): Konversi Otomatis via Introspeksi Database 🔥 (SANGAT DISARANKAN)
Karena aplikasi sebelumnya sudah memiliki database yang berjalan (hasil migrasi Sequelize), cara paling terjamin agar tidak ada relasi atau tipe data yang terlewat adalah dengan "menarik" (introspect) struktur tabel langsung dari database.

**Langkah-langkah Eksekusi:**
1. Pastikan database lama sedang berjalan di lokal Anda.
2. Buka terminal di folder `Backend`.
3. Jalankan perintah:
   ```bash
   npx prisma db pull
   ```
4. Prisma secara ajaib akan membaca seluruh 43 tabel dan relasinya, lalu menuliskannya secara otomatis dengan format yang sempurna ke dalam `prisma/schema.prisma`.

---

### Tahap 2 (OPSI B): Konversi Manual (Jika Opsi A tidak memungkinkan)
Jika database lama sudah tidak ada dan kita benar-benar harus membaca file `.js` satu per satu, terapkan panduan konversi (*Mapping*) berikut.

**Aturan Konversi Dasar:**
- `DataTypes.STRING` ➡️ `String`
- `DataTypes.INTEGER` ➡️ `Int`
- `DataTypes.TEXT` ➡️ `String @db.Text`
- `DataTypes.ENUM([...])` ➡️ Buat `enum` terpisah di Prisma.
- `DataTypes.DATE` ➡️ `DateTime`
- Foreign Key & Relasi ➡️ Menggunakan `@relation`.

**Contoh Hasil Konversi dari 5 Model Core (Sebagai Referensi Utama):**

```prisma
// 1. Model User
model User {
  id           Int      @id @default(autoincrement())
  name         String?
  kode         String?
  refreshToken String?  @db.Text
  password     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// 2. Model Member
model Member {
  id             Int      @id @default(autoincrement())
  kode           String?
  fullname       String?
  whatsappnumber String?
  kode_agen      String?
  password       String?
  saldo          Int?
  status         MemberStatus?
  type           MemberType?
  agenType       AgenType?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relasi
  riwayatTransaksi        RiwayatTransaksi[]
  notifMemberReads        NotifMemberRead[]
  resetPasswords          ResetPassword[]
  paymentFeeAgenHistories PaymentFeeAgenHistory[]
  promos                  Promo[]
}

enum MemberStatus {
  unverified
  verfied
}

enum MemberType {
  outletpulsa
  amra
}

enum AgenType {
  silver
  gold
  platinum
}

// 3. Model Produk
model Produk {
  id             Int      @id @default(autoincrement())
  operatorId     Int?
  kode           String?
  name           String?
  type           ProdukType?
  purchase_price Int?
  markup         Int?
  serverId       Int?
  status         ProdukStatus?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relasi BelongsTo
  operator Operator? @relation(fields: [operatorId], references: [id])
  server   Server?   @relation(fields: [serverId], references: [id])
  
  // Relasi HasMany
  transactions           Transaction[]
  digiflazzProducts      DigiflazzProduct[]
  iakPrabayarProduks     IakPrabayarProduk[]
  tripayPrabayarProduks  TripayPrabayarProduk[]
}

enum ProdukType {
  prabayar
  pascabayar
}

enum ProdukStatus {
  active
  inactive
}

// 4. Model Transaction
model Transaction {
  id                 Int      @id @default(autoincrement())
  kode               String?
  type               ProdukType?
  produkId           Int?
  riwayatTransaksiId Int?
  nomorTujuan        String?
  ket                String?  @db.Text
  purchase_price     Int?
  selling_price      Int?
  kodeAgen           String?
  laba               Int?
  fee_agen           Int?
  status_fee_agen    FeeAgenStatus?
  serverId           Int?
  status             TransactionStatus?
  trx_id             Int?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relasi
  produk             Produk?           @relation(fields: [produkId], references: [id])
  server             Server?           @relation(fields: [serverId], references: [id])
  riwayatTransaksi   RiwayatTransaksi? @relation(fields: [riwayatTransaksiId], references: [id])
  digiflazzTransactions DigiflazzTransaction[]
}

enum FeeAgenStatus {
  paid
  unpaid
}

enum TransactionStatus {
  proses
  gagal
  sukses
}

// 5. Model Request Deposit
model RequestDeposit {
  id                 Int      @id @default(autoincrement())
  kode               String?
  riwayatTransaksiId Int?
  nominal            Int?
  nominalTambahan    Int?
  status             TransactionStatus?
  bankTransferId     Int?
  waktuRequest       DateTime?
  statusKirim        StatusKirim?
  alasanPenolakan    String?  @db.Text
  actionDo           ActionDo?
  count_penolakan    Int?
  waktuKirim         DateTime?
  waktuNotifikasi    DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relasi
  riwayatTransaksi   RiwayatTransaksi? @relation(fields: [riwayatTransaksiId], references: [id])
  bankTransferOutlet BankTransferOutlet? @relation(fields: [bankTransferId], references: [id])
  riwayatMutasis     RiwayatMutasi[]
}

enum StatusKirim {
  sudah_kirim
  belum_kirim
}

enum ActionDo {
  member
  admin
  almutasi
}

// (Terapkan pola di atas ke 38 file model lainnya jika menggunakan OPSI B)
```

---

### Tahap 3: Format & Validasi (Anti-Error)
Setelah `schema.prisma` terisi (baik via *pull* maupun *manual*), langkah selanjutnya sangat krusial untuk mencegah error:
1. Jalankan perintah format:
   ```bash
   npx prisma format
   ```
   *(Ini akan merapikan indentasi dan memperingatkan Anda jika ada relasi atau penamaan yang salah).*
2. Pastikan semua *foreign key* dan referensi model di Prisma menggunakan tipe data yang persis sama dengan Primary Key tabel asalnya.

---

### Tahap 4: Generate Client
Agar schema bisa digunakan di NestJS:
1. Jalankan perintah:
   ```bash
   npx prisma generate
   ```
2. Cek apakah folder `node_modules/@prisma/client` sudah terbuat tanpa error.

---
**Catatan untuk Junior / AI Eksekutor:** Jangan langsung menjalankan `prisma db push` atau `prisma migrate dev` jika Anda belum yakin 100% skemanya benar, kecuali Anda beroperasi di database kosong khusus testing. Gunakan `prisma format` terlebih dahulu untuk memvalidasi syntax.
