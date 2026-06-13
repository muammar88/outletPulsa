import { PrismaClient, ProdukType } from '@prisma/client';

export default async function seedKategori(prisma: PrismaClient) {
  console.log('Menjalankan seeding Kategori...');
  
  const datalist = [
    { id: 1, kode: 'PIU', name: 'Pulsa Isi Ulang', type: ProdukType.prabayar },
    { id: 2, kode: 'PT', name: 'Pulsa Transfer', type: ProdukType.prabayar },
    { id: 3, kode: 'PI', name: 'Pulsa Internasional', type: ProdukType.prabayar },
    { id: 4, kode: 'PD', name: 'Paket Data', type: ProdukType.prabayar },
    { id: 5, kode: 'PTP', name: 'Paket Telpon', type: ProdukType.prabayar },
    { id: 6, kode: 'PS', name: 'Paket SMS', type: ProdukType.prabayar },
    { id: 7, kode: 'TL', name: 'Token Listrik', type: ProdukType.prabayar },
    { id: 8, kode: 'VG', name: 'Voucher Game', type: ProdukType.prabayar },
    { id: 9, kode: 'UD', name: 'Uang Digital', type: ProdukType.prabayar },
    { id: 10, kode: 'WIFI', name: 'Wifi ID', type: ProdukType.prabayar },
    { id: 11, kode: 'TVK', name: 'TV Kabel', type: ProdukType.pascabayar },
    { id: 12, kode: 'VM', name: 'Voucher Makan', type: ProdukType.prabayar },
    { id: 13, kode: 'VB', name: 'Voucher Belanja', type: ProdukType.prabayar },
    { id: 14, kode: 'VD', name: 'Voucher Digital', type: ProdukType.prabayar },
    { id: 15, kode: 'MA', name: 'Masa Aktif', type: ProdukType.prabayar },
    { id: 16, kode: 'TPG', name: 'Token Pertagas', type: ProdukType.prabayar },
    { id: 17, kode: 'TB', name: 'Transfer Bank', type: ProdukType.prabayar },
    { id: 18, kode: 'UV', name: 'Unlock Voucher', type: ProdukType.prabayar },
    { id: 19, kode: 'UKP', name: 'Unlock Kartu Perdana', type: ProdukType.prabayar },
    { id: 20, kode: 'ET', name: 'E-Toll', type: ProdukType.prabayar },
    { id: 21, kode: 'TVP', name: 'TV Prabayar', type: ProdukType.prabayar },
    { id: 22, kode: 'PLNPASCABAYAR', name: 'PLN Pascabayar', type: ProdukType.pascabayar },
    { id: 23, kode: 'Telkom', name: 'TELKOM', type: ProdukType.pascabayar },
    { id: 24, kode: 'BPJS', name: 'BPJS', type: ProdukType.pascabayar },
    { id: 25, kode: 'PDAM', name: 'PDAM', type: ProdukType.pascabayar },
    { id: 26, kode: 'PGN', name: 'PGN', type: ProdukType.pascabayar },
    { id: 27, kode: 'INT', name: 'Internet', type: ProdukType.prabayar }
  ];

  console.log(`Menemukan ${datalist.length} data kategori. Memulai insert ke database...`);
  
  const chunkSize = 50;
  let inserted = 0;
  for (let i = 0; i < datalist.length; i += chunkSize) {
    const chunk = datalist.slice(i, i + chunkSize);
    try {
      await prisma.kategori.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
  
  console.log(`Seeding Kategori selesai. Berhasil memproses ${inserted} kategori.`);
}
