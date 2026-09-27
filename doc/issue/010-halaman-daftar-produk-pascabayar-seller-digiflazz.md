# ISSUE-010 — Halaman Daftar Produk Pascabayar Seller Digiflazz

## Status

**SELESAI**

Seluruh kriteria penerimaan sudah memiliki bukti. Laporan pemeriksaan ronde kedua
diperlukan pada bagian 11 dan ditulis pada bagian 12.

Issue ini dibuat berdasarkan kondisi repository pada 27 September 2026. Jangan mengubah status menjadi selesai hanya karena halaman dapat dirender. Seluruh koneksi data, validasi backend, menu, build, dan regresi pada bagian akhir wajib diperiksa.

## 1. Tujuan

Buat halaman administrator baru pada lokasi berikut:

```text
Frontend/src/modules/Administrator/DaftarProdukPascabayarSellerDigiflazz
```

Halaman ini harus:

1. Menampilkan katalog produk pascabayar Digiflazz beserta seller yang menyediakan produk tersebut.
2. Memungkinkan admin mencari dan memfilter katalog berdasarkan SKU, nama, kategori, seller, status ketersediaan, dan status koneksi.
3. Menampilkan produk pascabayar internal yang sudah terhubung ke setiap produk Digiflazz.
4. Memungkinkan admin menghubungkan produk pascabayar Digiflazz ke produk pascabayar internal aplikasi.
5. Memungkinkan admin melepas koneksi yang tidak sedang menjadi provider aktif.
6. Menyediakan sinkronisasi katalog pascabayar Digiflazz secara manual dengan konfirmasi dan hasil yang jelas.
7. Terdaftar sebagai tab pada menu **Daftar Produk DigiFlazz**.

Gunakan halaman prabayar berikut sebagai acuan tata letak, filter, tabel, pagination, loading, notifikasi, dan konfirmasi:

```text
Frontend/src/modules/Administrator/DaftarProdukSellerDigiflazz/DaftarProdukSellerDigiflazz.vue
```

Gunakan halaman berikut sebagai acuan alur menghubungkan produk provider dengan produk pascabayar internal:

```text
Frontend/src/modules/Administrator/DaftarProdukPascabayarIAK/DaftarProdukPascabayarIAK.vue
Frontend/src/modules/Administrator/DaftarProdukPascabayarIAK/components/DaftarProdukPascabayarIAKKoneksiModal.vue
```

Jangan menyalin kode secara buta. Struktur data Digiflazz pascabayar menggunakan arsitektur multiprovider yang berbeda dari relasi lama IAK.

## 2. Keputusan bisnis dan teknis yang wajib dipertahankan

Bagian ini adalah keputusan tetap. Jangan meminta konfirmasi ulang untuk hal-hal ini.

### 2.1 Sumber data utama

Gunakan model yang sudah ada:

- `DigiflazzPascabayarProduct`: katalog produk/seller pascabayar hasil sinkronisasi Digiflazz.
- `ProdukPascabayarProvider`: koneksi antara produk pascabayar internal dan provider `DIGIFLAZZ`.
- `ProdukPascabayar`: produk pascabayar milik aplikasi.

Jangan menggunakan model prabayar berikut sebagai tempat menyimpan data pascabayar:

- `DigiflazzProduct`
- `DigiflazzSellerProduct`
- `DigiflazzTransaction`

Jangan menambah field `produkPascabayarId` langsung ke `DigiflazzPascabayarProduct`. Sumber kebenaran koneksi multiprovider tetap `ProdukPascabayarProvider`.

### 2.2 Makna seller

Nama seller pascabayar berasal dari field `sellerName` pada `DigiflazzPascabayarProduct`, yang disinkronkan dari `seller_name` respons daftar harga Digiflazz pascabayar.

Model `DigiflazzSeller` saat ini dipakai oleh alur prabayar. Jangan menghubungkannya ke pascabayar hanya berdasarkan kecocokan teks nama tanpa migrasi dan alasan bisnis yang teruji.

Halaman harus dapat menampilkan serta memfilter `sellerName`. Nilai seller kosong ditampilkan sebagai `-` atau `Seller tidak tersedia`, bukan membuat seller palsu.

### 2.3 Koneksi tidak otomatis mengaktifkan provider

Saat produk Digiflazz dihubungkan ke produk internal:

- Buat/perbarui pemetaan `ProdukPascabayarProvider` dengan provider `DIGIFLAZZ`.
- `providerSku` harus sama persis dengan `buyerSkuCode` katalog yang dipilih.
- `digiflazzProductId` harus menunjuk ID katalog yang dipilih.
- `iakProductId` harus `null`.
- Pemetaan baru tetap `isActive = false`.

Admin tetap memilih provider aktif dari alur Produk Pascabayar/perbandingan provider yang sudah ada. Jangan membuat koneksi baru otomatis mengambil alih IAK. Ini mencegah inquiry baru berpindah provider tanpa tindakan admin yang jelas.

### 2.4 Pengguna mobile tidak memilih provider

Jangan menambah pilihan IAK/Digiflazz pada aplikasi mobile atau payload mobile. Provider dipilih oleh admin. Inquiry yang sudah dibuat harus tetap memakai snapshot provider dan SKU asal walaupun admin mengubah pemetaan setelahnya.

### 2.5 Status provider bersifat baca saja pada halaman ini

`buyerProductStatus` dan `sellerProductStatus` berasal dari Digiflazz. Tampilkan keduanya sebagai status ketersediaan.

Jangan menyalin tombol `temp_status` prabayar ke halaman ini karena `DigiflazzPascabayarProduct` tidak memiliki kontrak status lokal tersebut. Jika dibutuhkan status lokal baru, itu harus menjadi issue terpisah dengan dampak routing yang jelas.

### 2.6 Makna harga dan biaya

Pada katalog pascabayar:

- `admin` = biaya admin provider yang tersedia di katalog.
- `commission` = komisi buyer yang tersedia di katalog.
- `price` dapat kosong dan tidak boleh dianggap sebagai nominal tagihan pelanggan.
- Nominal tagihan final baru berasal dari inquiry transaksi.

Jangan menghitung atau menampilkan `price` katalog sebagai tagihan pelanggan. Nilai `null` harus ditampilkan sebagai `Belum tersedia`, bukan `Rp0`.

## 3. Kondisi repository saat issue dibuat

### 3.1 Model Prisma yang sudah tersedia

`Backend/prisma/schema.prisma` sudah memiliki:

```prisma
model DigiflazzPascabayarProduct {
  id                  Int       @id @default(autoincrement())
  buyerSkuCode        String    @unique
  name                String?
  category            String?
  brand               String?
  sellerName          String?
  price               Int?
  admin               Int?
  commission          Int?
  buyerProductStatus  Boolean?
  sellerProductStatus Boolean?
  desc                String?   @db.Text
  syncedAt            DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  providerSelections ProdukPascabayarProvider[]
}
```

`ProdukPascabayarProvider` sudah menyimpan `produkPascabayarId`, `provider`, `providerSku`, `digiflazzProductId`, dan `isActive`.

Tidak ada migrasi database yang diperlukan hanya untuk membuat halaman ini. Jika implementasi menemukan kebutuhan perubahan skema, periksa kembali apakah data tersebut sebenarnya sudah dapat diperoleh melalui relasi di atas. Jangan membuat tabel duplikat.

### 3.2 Endpoint backend yang sudah tersedia

Controller:

```text
Backend/src/administrator/pascabayar_provider/pascabayar_provider.controller.ts
```

Service:

```text
Backend/src/providers/pascabayar/pascabayar-catalog.service.ts
```

Endpoint yang sudah ada:

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `POST` | `/administrator/pascabayar-provider/katalog-digiflazz/sync` | Sinkron katalog pascabayar |
| `GET` | `/administrator/pascabayar-provider/katalog-digiflazz` | Daftar katalog, pagination, pencarian, kategori, status koneksi |
| `GET` | `/administrator/pascabayar-provider/katalog-digiflazz/kategori` | Daftar kategori |
| `GET` | `/administrator/pascabayar-provider/internal-products` | Pilihan produk pascabayar internal |
| `POST` | `/administrator/pascabayar-provider/produk/:id/connect` | Hubungkan produk internal dengan provider |
| `POST` | `/administrator/pascabayar-provider/produk/:id/select` | Pilih provider aktif untuk inquiry baru |
| `POST` | `/administrator/pascabayar-provider/produk/:id/disconnect` | Lepas pemetaan provider |

Endpoint daftar saat ini sudah menyertakan `providerSelections` dan `produkPascabayar`. Gunakan kontrak tersebut; jangan membuat request per baris untuk mendapatkan nama produk internal.

### 3.3 Frontend yang sudah tersedia

Service berikut sudah dapat digunakan atau diperluas:

```text
Frontend/src/modules/Administrator/ProdukPascabayar/services/PascabayarProviderService.ts
```

Saat ini service tersebut sudah memiliki fungsi daftar katalog, sinkronisasi, koneksi, pemilihan provider aktif, dan pelepasan koneksi. Boleh membuat service khusus halaman pada:

```text
Frontend/src/service/administrator/daftarProdukPascabayarSellerDigiflazz.ts
```

Jika membuat service baru, jadikan itu pembungkus endpoint yang sama. Jangan menduplikasi aturan bisnis di frontend.

## 4. Hasil antarmuka yang diminta

### 4.1 Struktur folder minimum

```text
Frontend/src/modules/Administrator/DaftarProdukPascabayarSellerDigiflazz/
├── DaftarProdukPascabayarSellerDigiflazz.vue
└── components/
    ├── DaftarProdukPascabayarSellerDigiflazzDetailModal.vue
    └── DaftarProdukPascabayarSellerDigiflazzKoneksiModal.vue
```

Nama komponen boleh disederhanakan jika konsisten, tetapi file halaman utama dan folder target wajib sesuai permintaan.

### 4.2 Judul halaman

Gunakan judul dan deskripsi yang jelas:

- Judul: **Daftar Produk Pascabayar Seller Digiflazz**
- Deskripsi: **Katalog seller, biaya, ketersediaan, dan koneksi produk pascabayar Digiflazz**

### 4.3 Kolom tabel minimum

| Kolom | Sumber data | Aturan tampilan |
| --- | --- | --- |
| SKU Seller | `buyerSkuCode` | Teks monospace; pertahankan karakter persis |
| Produk Digiflazz | `name` | Jangan fallback ke SKU jika nama kosong tanpa label |
| Seller | `sellerName` | `-` bila kosong |
| Kategori/Brand | `category`, `brand` | Tampilkan keduanya secara ringkas |
| Admin Provider | `admin` | Rupiah; `Belum tersedia` bila null |
| Komisi | `commission` | Rupiah; `Belum tersedia` bila null |
| Status Buyer | `buyerProductStatus` | Tersedia/Tidak tersedia/Belum diketahui |
| Status Seller | `sellerProductStatus` | Tersedia/Tidak tersedia/Belum diketahui |
| Produk Internal | `providerSelections[].produkPascabayar` | Nama + kode; tampilkan semua bila lebih dari satu |
| Provider Aktif | `providerSelections[].isActive` | Badge aktif/tidak aktif per koneksi |
| Sinkron Terakhir | `syncedAt` | Format tanggal lokal atau `-` |
| Aksi | data baris | Detail, Hubungkan, Lepas koneksi |

Jangan menampilkan nilai `null` sebagai nol pada kolom keuangan.

### 4.4 Filter dan pagination

Sediakan:

1. Pencarian dengan debounce sekitar 400–500 ms untuk SKU, nama, brand, dan seller.
2. Filter seller.
3. Filter kategori.
4. Filter koneksi: Semua, Sudah terhubung, Belum terhubung.
5. Filter ketersediaan: Semua, Tersedia, Tidak tersedia, Belum diketahui.
6. Pagination server-side menggunakan `page`, `limit`, `total`, dan `totalPages`.

Mengubah filter harus mengembalikan halaman ke halaman 1.

### 4.5 Sinkronisasi

Tombol **Sinkronkan Produk Pascabayar Digiflazz** harus:

1. Memunculkan dialog konfirmasi.
2. Menonaktifkan tombol selama request berjalan.
3. Memanggil endpoint pascabayar `katalog-digiflazz/sync`, bukan endpoint prabayar.
4. Menampilkan jumlah `inserted`, `updated`, dan `total` dari respons.
5. Memuat ulang daftar seller, kategori, dan tabel setelah berhasil.
6. Menampilkan pesan backend jika sinkronisasi gagal.
7. Tidak menghapus katalog/koneksi lama ketika respons provider kosong atau request gagal.

### 4.6 Modal detail

Modal detail harus menampilkan sekurangnya:

- SKU
- nama produk
- seller
- kategori
- brand
- admin
- komisi
- status buyer
- status seller
- deskripsi
- waktu sinkronisasi
- daftar koneksi produk internal beserta `isActive`

Render `desc` sebagai teks. Jangan menggunakan `v-html` untuk data provider.

### 4.7 Modal koneksi

Modal koneksi mengikuti pola IAK, dengan perbedaan berikut:

1. Header menampilkan identitas produk Digiflazz: SKU, nama, seller, kategori, admin, dan komisi.
2. Produk internal dicari melalui endpoint backend, bukan memuat seluruh tabel di browser.
3. Tampilkan kode, nama, kategori, fee aplikasi, dan komisi internal pada pilihan.
4. Produk internal yang sudah memiliki pemetaan `DIGIFLAZZ` harus diberi label jelas atau dikeluarkan dari pilihan agar tidak tertimpa tanpa disadari.
5. Saat menyimpan, kirim data berikut melalui endpoint koneksi yang sudah ada:

```json
{
  "provider": "DIGIFLAZZ",
  "providerSku": "<buyerSkuCode persis>",
  "digiflazzProductId": 123,
  "iakProductId": null
}
```

ID pada URL `/produk/:id/connect` adalah ID `ProdukPascabayar` internal, bukan ID katalog Digiflazz.

6. Setelah berhasil, tutup modal, tampilkan notifikasi, dan muat ulang tabel.
7. Jangan langsung memanggil endpoint `/select`. Koneksi baru tidak otomatis aktif.

### 4.8 Pelepasan koneksi

Untuk setiap pemetaan yang tidak aktif:

1. Sediakan aksi **Lepas koneksi**.
2. Tampilkan konfirmasi dengan nama produk internal, SKU, dan seller.
3. Panggil `/produk/:produkPascabayarId/disconnect` dengan body `{ "provider": "DIGIFLAZZ" }`.
4. Jika pemetaan aktif, tombol harus dinonaktifkan atau backend error ditampilkan dengan pesan: pilih provider pengganti terlebih dahulu.
5. Jangan menghapus baris `DigiflazzPascabayarProduct` ketika melepas koneksi.

## 5. Perubahan backend yang diperlukan

Pertahankan controller dan service multiprovider yang sudah ada. Tambahkan hanya kontrak yang belum tersedia untuk kebutuhan halaman.

### 5.1 Filter seller

Tambahkan query opsional `seller` pada:

```text
GET /administrator/pascabayar-provider/katalog-digiflazz
```

Filter harus diterapkan ke `sellerName` secara exact setelah admin memilih opsi seller. Pencarian bebas tetap boleh mencari `sellerName` secara `contains` case-insensitive.

### 5.2 Daftar seller

Tambahkan endpoint:

```text
GET /administrator/pascabayar-provider/katalog-digiflazz/sellers
```

Respons `data` berupa array string unik, tidak kosong, urut alfabet:

```json
{
  "message": "Success",
  "error": null,
  "data": ["SELLER A", "SELLER B"]
}
```

Ambil data dari distinct `sellerName` pada `DigiflazzPascabayarProduct`. Jangan mengambil daftar seller prabayar dari `DigiflazzSeller`.

### 5.3 Filter ketersediaan

Tambahkan query opsional `availability`:

- `available`: `buyerProductStatus = true` dan `sellerProductStatus = true`.
- `unavailable`: salah satu status bernilai `false`.
- `unknown`: salah satu status bernilai `null` dan tidak ada status `false`.
- kosong: tidak memfilter.

Jangan memakai pemeriksaan truthy/falsy karena `null` berbeda makna dari `false`.

### 5.4 Filter koneksi

Pertahankan query `connected`, tetapi pastikan relasi yang dihitung benar-benar pemetaan provider `DIGIFLAZZ`:

- `connected`: terdapat `providerSelections` dengan `provider = DIGIFLAZZ`.
- `disconnected`: tidak terdapat pemetaan tersebut.

### 5.5 Pilihan produk internal yang aman

Perluas endpoint `internal-products` dengan query opsional `provider=DIGIFLAZZ` dan `connection=available`.

Untuk modal halaman ini, hasil `available` hanya memuat produk internal yang belum memiliki pemetaan provider `DIGIFLAZZ`. Produk yang sedang terhubung ke baris katalog yang sedang diedit boleh dikembalikan sebagai `current` jika parameter ID katalog diberikan.

Jangan mengubah pemetaan Digiflazz lama ke SKU baru secara diam-diam. Bila admin ingin memindahkan koneksi, lepas koneksi lama lebih dahulu. Pertahankan perlindungan bahwa pemetaan aktif tidak boleh dilepas.

### 5.6 Validasi koneksi

Sebelum menyimpan koneksi `DIGIFLAZZ`, backend wajib memvalidasi:

1. Produk internal ada.
2. `digiflazzProductId` ada.
3. `buyerSkuCode` katalog sama persis dengan `providerSku` request.
4. Katalog tidak berstatus unavailable (`buyerProductStatus === false` atau `sellerProductStatus === false`). Status `null` boleh dipetakan tetapi UI harus memberi label belum diketahui.
5. Produk internal belum memiliki pemetaan Digiflazz lain. Jika sudah ada SKU berbeda, kembalikan HTTP 400 dengan pesan yang meminta admin melepas koneksi lama.
6. Pemetaan ulang idempoten ke katalog/SKU yang sama tidak membuat duplikat.

Jalankan pemeriksaan dan penulisan yang berhubungan dalam transaksi database bila ada kemungkinan dua request koneksi berjalan bersamaan. Jangan mengubah `isActive` pada pemetaan yang sudah ada ketika hanya memperbarui metadata yang sama.

### 5.7 Bentuk respons daftar

Pertahankan bentuk pagination:

```json
{
  "message": "Success",
  "error": null,
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

Setiap item `list` harus menyertakan `providerSelections` dengan bentuk minimum:

```json
{
  "id": 55,
  "produkPascabayarId": 10,
  "provider": "DIGIFLAZZ",
  "providerSku": "PLNPOSTPAID",
  "isActive": false,
  "produkPascabayar": {
    "id": 10,
    "kode": "PLN-PASCA",
    "name": "PLN Pascabayar"
  }
}
```

Jangan mengembalikan credential Digiflazz, API key, atau data rahasia melalui endpoint admin ini.

## 6. Pendaftaran menu dan tab

Gunakan path tab berikut secara konsisten:

```text
daftar_produk_pascabayar_seller_digiflazz
```

Kerjakan semua bagian ini:

1. Tambahkan lazy component pada:

```text
Frontend/src/views/administrator/components/Content/TabComponents.ts
```

Tambahkan key berikut ke object `tabComponents`:

```ts
daftar_produk_pascabayar_seller_digiflazz: defineAsyncComponent(
  () =>
    import(
      '@/modules/Administrator/DaftarProdukPascabayarSellerDigiflazz/DaftarProdukPascabayarSellerDigiflazz.vue'
    ),
),
```

Nama key wajib sama persis dengan `path` pada seed tab. Setelah implementasi, buka tab dari menu administrator dan pastikan komponen benar-benar dirender tanpa pesan `Component not found`, bukan hanya memastikan build berhasil.

2. Tambahkan tab pada:

```text
Backend/prisma/seeds/tab.seed.ts
```

Tambahkan object berikut ke array `tabsData`. Jangan membuat seeder terpisah dan jangan mengganti path tab Digiflazz yang sudah ada:

```ts
{
  name: 'Daftar Produk Pascabayar Seller Digiflazz',
  icon: 'IconListCheck',
  path: 'daftar_produk_pascabayar_seller_digiflazz',
  desc: 'Mengelola katalog seller dan koneksi produk pascabayar Digiflazz.'
}
```

3. Tambahkan ID tab tersebut pada submenu **Daftar Produk DigiFlazz** di:

```text
Backend/prisma/seeds/sub.seed.ts
```

Pada item `subMenusData` dengan `name: 'Daftar Produk DigiFlazz'`, tambahkan tab baru ke array `tab`. Bentuk akhirnya harus memuat keempat tab Digiflazz berikut:

```ts
{
  menu_name: 'Produk',
  name: 'Daftar Produk DigiFlazz',
  icon: 'IconBox',
  path: 'daftar_produk_digiflazz',
  tab: JSON.stringify(
    [
      getTabId('daftar_produk_digiflazz'),
      getTabId('daftar_produk_seller_digiflazz'),
      getTabId('daftar_produk_pascabayar_seller_digiflazz'),
      getTabId('daftar_seller_digiflazz'),
    ]
      .filter(Boolean)
      .map((id) => ({ id })),
  ),
},
```

4. Jangan menghapus atau mengganti urutan identitas tab prabayar Digiflazz yang sudah ada. Penambahan hanya menyisipkan tab pascabayar baru.
5. `tab.seed.ts` harus dijalankan sebelum `sub.seed.ts`, mengikuti urutan pada `Backend/prisma/seed.ts`, agar `getTabId('daftar_produk_pascabayar_seller_digiflazz')` tidak menghasilkan `undefined`.
6. Periksa mekanisme RBAC/tab pada seed. User yang sudah memiliki akses submenu Digiflazz harus mendapatkan tab baru sesuai pola seed yang berlaku. Jangan memberi akses dengan bypass guard.
7. Verifikasi seed secara idempoten: menjalankan seed dua kali tidak boleh membuat tab atau submenu duplikat.

## 7. Urutan pengerjaan yang wajib diikuti

### Langkah 1 — Baseline

1. Baca `git status` dan `git diff` terlebih dahulu.
2. Jangan menimpa perubahan yang bukan bagian issue ini.
3. Jalankan build frontend dan tes katalog pascabayar yang ada untuk mencatat baseline.
4. Baca seluruh file yang disebut pada bagian 1–6 sebelum mengedit.

### Langkah 2 — Backend query dan kontrak

1. Tambahkan filter seller, availability, dan koneksi yang benar.
2. Tambahkan endpoint daftar seller pascabayar.
3. Perluas pilihan produk internal agar koneksi lama tidak tertimpa diam-diam.
4. Perketat validasi `connectProvider` tanpa merusak koneksi IAK.
5. Pertahankan response envelope `{ message, error, data }`.
6. Tambahkan unit test sebelum mengerjakan UI agar kontrak frontend stabil.

### Langkah 3 — Service dan tipe frontend

1. Buat/perluas service API.
2. Buat interface TypeScript untuk katalog, seller, mapping, pagination, dan pilihan produk internal.
3. Hindari `any` pada data utama halaman dan modal.
4. Pastikan parameter kosong tidak dikirim sebagai string `undefined`.

### Langkah 4 — Halaman utama

1. Buat folder dan halaman target.
2. Gunakan `BaseTable`, `usePagination`, `useNotification`, dan `useConfirmation` seperti halaman referensi.
3. Implementasikan search, filter, pagination, refresh, dan sinkronisasi.
4. Tampilkan state loading, empty state, dan error secara jelas.
5. Jangan hanya menulis error ke `console.error`; tampilkan notifikasi kepada admin.

### Langkah 5 — Detail dan koneksi

1. Buat modal detail aman tanpa `v-html`.
2. Buat modal pencarian produk internal dengan debounce.
3. Hubungkan menggunakan ID produk internal pada URL serta SKU dan ID katalog pada body.
4. Muat ulang tabel setelah koneksi.
5. Implementasikan pelepasan koneksi dengan perlindungan mapping aktif.

### Langkah 6 — Menu dan akses

1. Daftarkan lazy component.
2. Perbarui seed tab dan submenu.
3. Verifikasi nama path identik di frontend dan seed.
4. Pastikan halaman tidak dapat diakses tanpa autentikasi administrator pada endpoint backend.

### Langkah 7 — Regresi

Periksa ulang bahwa perubahan ini tidak merusak:

- halaman `DaftarProdukSellerDigiflazz` prabayar;
- halaman `DaftarProdukPascabayarIAK`;
- modal pemilihan provider pada `ProdukPascabayar`;
- sinkronisasi katalog Digiflazz pascabayar yang sudah ada;
- koneksi dan pemilihan provider IAK;
- inquiry/pembayaran/status pascabayar;
- snapshot provider/SKU transaksi lama;
- tampilan mobile dan struk pascabayar;
- fitur LinkQu/topup saldo.

Tidak perlu mengubah mobile untuk menyelesaikan halaman admin ini. Jika mobile berubah, jelaskan alasan konkret dan tambahkan regresi yang sesuai.

## 8. Matriks tes wajib

### 8.1 Backend unit test

Tambahkan tes pada `pascabayar-catalog.spec.ts` atau spec controller/service khusus untuk kasus berikut:

| Kasus | Hasil yang wajib |
| --- | --- |
| List tanpa filter | Pagination dan `providerSelections.produkPascabayar` tersedia |
| Pencarian seller/nama/SKU | Query Prisma memakai kondisi yang benar |
| Filter seller | Exact seller yang dipilih |
| Filter available | Kedua status harus `true` |
| Filter unavailable | Sedikitnya satu status `false` |
| Filter unknown | Tidak ada status `false`, sedikitnya satu `null` |
| Filter connected | Hanya mapping provider `DIGIFLAZZ` |
| Daftar seller | Unik, tanpa null/kosong, urut alfabet |
| Connect valid | SKU dan ID katalog tersimpan, IAK null, tidak otomatis aktif |
| Connect SKU berbeda | HTTP 400, tidak ada write |
| Internal sudah terhubung SKU lain | HTTP 400, mapping lama tidak tertimpa |
| Connect identik dua kali | Tidak ada duplikat dan hasil idempoten |
| Katalog unavailable | Koneksi ditolak |
| Disconnect tidak aktif | Mapping terhapus, katalog tetap ada |
| Disconnect aktif | Ditolak, admin diminta memilih provider pengganti |
| Sync gagal/kosong | Katalog dan mapping lama tidak dihapus |

Gunakan mock Prisma/Digiflazz untuk unit test. Jangan mengklaim unit test mock sebagai bukti migrasi atau konkurensi database nyata.

### 8.2 Frontend

Jika repository memiliki test runner komponen yang aktif, uji:

1. Mapping respons ke tabel.
2. Null pada admin/komisi/status.
3. Pergantian filter mereset halaman.
4. Payload koneksi memakai ID internal di URL dan ID katalog di body.
5. Mapping aktif tidak menawarkan tombol lepas.
6. Error backend tampil sebagai notifikasi.

Jika tidak ada test runner frontend, jangan menambah framework baru hanya untuk issue ini. Jalankan build produksi dan catat verifikasi manual yang dilakukan.

### 8.3 Perintah verifikasi minimum

Dari folder `Backend`:

```powershell
node node_modules/jest/bin/jest.js --runInBand --testPathPatterns=pascabayar-catalog --silent
node node_modules/jest/bin/jest.js --runInBand --testPathPatterns=pascabayar --silent
npm.cmd run build
```

Dari folder `Frontend`:

```powershell
npm.cmd run build
```

Dari root repository:

```powershell
git diff --check
```

Laporkan angka suite/tes aktual. Jangan menyalin angka dari ISSUE-009.

## 9. Kriteria penerimaan

Issue dapat dinyatakan selesai hanya jika seluruh poin berikut terpenuhi:

- [x] Folder dan halaman target tersedia.
- [x] Halaman terdaftar pada `TabComponents.ts`.
- [x] Key `daftar_produk_pascabayar_seller_digiflazz` pada `TabComponents.ts` menunjuk ke file halaman yang benar dan dapat dirender dari menu administrator.
- [x] Seed tab dan submenu Digiflazz diperbarui.
- [x] `Backend/prisma/seeds/tab.seed.ts` memiliki satu tab dengan path `daftar_produk_pascabayar_seller_digiflazz`.
- [x] `Backend/prisma/seeds/sub.seed.ts` memasukkan ID tab baru ke submenu `Daftar Produk DigiFlazz` tanpa menghapus tiga tab lama.
- [x] Tabel memakai endpoint pascabayar, bukan prabayar.
- [x] Search, seller, kategori, availability, koneksi, dan pagination bekerja server-side.
- [x] Daftar seller berasal dari `DigiflazzPascabayarProduct.sellerName`.
- [x] Nilai null tidak ditampilkan sebagai nol.
- [x] Sinkronisasi mempunyai konfirmasi, loading, hasil, dan error feedback.
- [x] Detail modal menampilkan data katalog dan koneksi internal.
- [x] Modal koneksi mencari produk internal dari backend.
- [x] Payload koneksi memakai provider `DIGIFLAZZ`, SKU persis, dan ID katalog yang benar.
- [x] Koneksi baru tidak otomatis menjadi aktif.
- [x] Produk internal yang sudah terhubung tidak tertimpa diam-diam.
- [x] Pemetaan aktif tidak dapat dilepas.
- [x] Tidak ada pilihan provider pada mobile.
- [x] Tidak ada model/tabel pemetaan pascabayar kedua.
- [x] Unit test backend baru lulus.
- [x] Seluruh tes pascabayar yang relevan lulus.
- [x] Build backend lulus.
- [x] Build frontend lulus.
- [x] `git diff --check` lulus.
- [x] Tidak ada credential, hasil build, atau file `.env` yang ikut di-commit.

## 10. Instruksi kerja untuk AI pelaksana

1. Kerjakan issue ini sampai seluruh pekerjaan lokal yang dapat dilakukan selesai.
2. Jangan terlalu banyak bertanya. Gunakan keputusan pada issue ini dan pola kode repository sebagai pedoman.
3. Jangan meminta izin untuk membaca file, mengedit kode, menambah unit test, menjalankan build, atau memperbaiki kegagalan yang memang bagian issue ini.
4. Bertanya hanya jika benar-benar terhalang oleh credential eksternal, akses yang tidak tersedia, atau keputusan bisnis yang belum didefinisikan di issue ini.
5. Jangan mengubah credential produksi, menjalankan pembayaran nyata, atau menjalankan migrasi pada database produksi.
6. Pertahankan perubahan pengguna lain di working tree.
7. Jangan menyatakan fitur selesai hanya berdasarkan tampilan. Buktikan kontrak API, koneksi database melalui unit test, menu, dan build.

## 11. Pemeriksaan ulang wajib setelah implementasi

Setelah merasa selesai, AI pelaksana wajib melakukan ronde pemeriksaan kedua:

1. Baca ulang issue ini dari awal sampai akhir.
2. Periksa setiap kotak pada bagian 9 terhadap kode dan hasil tes nyata.
3. Buka `git diff` dan periksa semua perubahan baris demi baris.
4. Cari endpoint prabayar yang mungkin salah dipakai oleh halaman baru.
5. Cari penggunaan model `DigiflazzSellerProduct` pada fitur baru; hasilnya harus tidak ada.
6. Periksa bahwa ID pada URL koneksi adalah ID produk internal, bukan ID katalog.
7. Periksa bahwa koneksi baru tidak mengubah `isActive` menjadi true.
8. Periksa bahwa filter connected hanya menghitung provider `DIGIFLAZZ`.
9. Periksa nilai `null`, status tidak diketahui, error API, empty state, dan double-click request.
10. Jalankan ulang seluruh perintah verifikasi pada bagian 8.3.
11. Jika masih ada poin yang belum dikerjakan atau tes gagal akibat perubahan issue ini, langsung perbaiki dan ulangi pemeriksaan tanpa bertanya lagi.
12. Tulis laporan akhir yang memisahkan: implementasi selesai, tes yang lulus, verifikasi manual, dan batas eksternal yang belum dapat diuji.

Status akhir hanya boleh **SELESAI** jika semua kriteria penerimaan memiliki bukti. Jika ada bagian lokal yang masih bisa dikerjakan, status tidak boleh ditulis `PARTIAL`; lanjutkan pengerjaan sampai selesai.
## 12. Laporan perbaikan lanjutan (ronde kedua)

Bagian ini menjawab temuan pemeriksaan ronde kedua. Seluruh pekerjaan lokal sudah
dikerjakan dan diverifikasi; tidak ada butir yang masih dapat dikerjakan tanpa akses
eksternal.

### 12.1 Daftar seller unik setelah trim (selesai)

- `Backend/src/providers/pascabayar/pascabayar-catalog.service.ts` men-trim nilai
  `sellerName` lalu melakukan deduplikasi tanpa memandang besar-kecil huruf sebelum
  pengurutan. `distinct` di database tetap dipakai sebagai optimasi baris, tetapi hasil
  akhir tidak lagi bergantung padanya.
- Tes baru "daftar seller menggabungkan nilai duplikat setelah trim tanpa memandang
  huruf besar-kecil" pada `Backend/src/providers/pascabayar/pascabayar-catalog.spec.ts`
  memakai masukan `Seller A`, ` Seller A `, `SELLER A`, `seller b`, `Seller B `, dan
  string kosong, lalu mengharapkan tepat dua seller unik.

### 12.2 Validasi input HTTP (selesai)

- DTO baru pada `Backend/src/administrator/pascabayar_provider/dto/`:
  `ConnectPascabayarProviderDto`, `ProviderActionDto`, `ListKatalogPascabayarDto`, dan
  `InternalProductsDto`.
- `digiflazzProductId` dan `iakProductId` divalidasi sebagai bilangan bulat positif.
  Nilai `"abc"`, `0`, dan negatif ditolak sebagai HTTP 400 oleh `ValidationPipe` global.
  `provider` dibatasi ke `IAK` atau `DIGIFLAZZ`.
- Seluruh `@Param('id')` memakai `ParsePositiveIntPipe` baru
  (`Backend/src/common/pipes/parse-positive-int.pipe.ts`), sehingga ID URL non-numerik,
  nol, atau negatif menjadi HTTP 400, bukan HTTP 500 dari Prisma.
- Field yang tidak didefinisikan dibuang oleh `whitelist`.
- Tes: `Backend/src/administrator/pascabayar_provider/pascabayar-provider.dto.spec.ts`
  (7 tes) memakai pipe yang sama dengan `main.ts`, ditambah
  `pascabayar_provider.controller.spec.ts` (5 tes) yang menembak endpoint HTTP nyata lewat
  supertest dan membuktikan status 400 serta service tidak dipanggil.

### 12.3 Verifikasi seed dan menu pada database uji (selesai)

Dijalankan pada database terisolasi `outletpulsa_issue010_test` (PostgreSQL lokal),
bukan database aplikasi `outletpulsa_db`.

- `tab.seed.ts` + `sub.seed.ts` dijalankan dua kali berturut-turut dari kondisi
  tab/submenu kosong. Hasil kedua sama persis dengan hasil pertama: `totalTabs=43`,
  tab baru berjumlah 1, dan submenu `Daftar Produk DigiFlazz` memuat tepat empat path:
  `daftar_produk_digiflazz`, `daftar_produk_seller_digiflazz`,
  `daftar_produk_pascabayar_seller_digiflazz`, `daftar_seller_digiflazz`.
  Tidak ada duplikat.
- `MenuService.getAll(..., role='administrator')` dijalankan terhadap database uji dan
  mengembalikan keempat path tersebut, termasuk tab baru. Pengguna administrator lama
  otomatis mendapat tab baru karena tab bersumber dari `TabMenu` global dan tidak
  dibatasi per grup. Tab baru mengikuti pola seed yang sama persis dengan tiga tab
  Digiflazz lain pada submenu tersebut. (Catatan: peran non-administrator pada kode saat
  ini mengembalikan menu kosong karena penyaringan `allowedMenus` belum diisi; ini
  perilaku pra-eksisting di luar cakupan ISSUE-010.)
- Catatan: seed penuh (`prisma/seed.ts`) gagal pada eksekusi kedua di
  `prisma/seeds/transaction.seed.ts` karena `trId` unik yang sudah ada. Ini masalah
  idempotensi pra-eksisting di luar cakupan ISSUE-010 dan tidak diubah.

### 12.4 Verifikasi konkurensi pada database nyata (selesai)

Dijalankan pada database uji yang sama memakai `PascabayarCatalogService` asli (bukan mock).

- Dua request bersamaan untuk produk internal yang sama dengan SKU berbeda menghasilkan
  `{"r1":"tolak:BadRequestException","r2":"ok:VERIFY-B","jumlahMapping":1}`. Hanya satu
  mapping tersimpan, request yang kalah ditolak dengan pesan "lepas koneksi lama", dan
  tidak ada mapping yang tertimpa.
- Tiga request bersamaan dengan SKU identik: ketiganya sukses idempoten dan hanya satu
  mapping tersimpan.

### 12.5 Verifikasi render komponen (selesai)

- Repositori tidak memiliki test runner komponen/e2e; sesuai bagian 8.2 framework baru
  tidak ditambahkan. Verifikasi memakai sumber yang sama dengan aplikasi:
  1. `TabComponents.ts` dimuat, key `daftar_produk_pascabayar_seller_digiflazz` ada, dan
     komponen async-nya berhasil di-resolve.
  2. `ContentViews.vue` dirender (SSR) dengan Pinia dan tab aktif pada path tersebut.
     Konten halaman (subjudul "Katalog seller, biaya, ketersediaan, dan koneksi produk
     pascabayar Digiflazz") muncul. Sebagai kontrol, saat path diarahkan ke nilai yang
     tidak ada, konten itu tidak muncul, sehingga jalur `tabComponents[path] ?? notFound`
     terbukti memilih komponen yang benar.
- Build produksi menghasilkan chunk `dist/assets/DaftarProdukPascabayarSellerDigiflazz-*.js`.
- Batas: klik langsung di browser dengan login belum dilakukan karena repositori tidak
  memiliki otomasi browser; bukti di atas menggantikannya pada tingkat komponen dan database.

### 12.6 Hasil verifikasi minimum

- `jest --testPathPatterns=pascabayar-catalog`: 1 suite, 27 tes lulus.
- `jest --testPathPatterns=pascabayar`: 15 suite, 132 tes lulus.
- `jest` penuh: 35 suite lulus / 5 suite gagal (13 tes gagal) - seluruh kegagalan
  pra-eksisting pada `pengumuman`, `riwayat_transfer_saldo`, dan `wapisender`.
- `npm.cmd run build` (Backend): lulus.
- `npm.cmd run build` (Frontend): lulus.
- `vue-tsc --noEmit`: 72 error pra-eksisting di file lain; 0 error pada file ISSUE-010
  (`DaftarProdukPascabayarSellerDigiflazz*`, `useConfirmation.ts`, `TabComponents.ts`).
- `git diff --check`: lulus. Tidak ada `dist/`, `.env`, atau file sementara yang tertinggal.