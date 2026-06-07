import { PrismaClient } from '@prisma/client';

export default async function notifSeed(prisma: PrismaClient) {
  await prisma.notifMemberRead.deleteMany({});
  await prisma.notif.deleteMany({});

  const notifsData = [
    { title: 'Promo Akhir Tahun', description: 'Nikmati diskon besar-besaran untuk semua produk pulsa dan kuota.' },
    { title: 'Pemeliharaan Sistem', description: 'Sistem akan mengalami pemeliharaan pada tanggal 25 Desember pukul 00:00 - 04:00 WIB.' },
    { title: 'Fitur Baru: Pascabayar', description: 'Kini Anda dapat membayar tagihan pascabayar langsung dari aplikasi.' },
    { title: 'Bonus Deposit', description: 'Dapatkan bonus saldo 5% untuk setiap deposit di atas Rp 1.000.000.' },
    { title: 'Perubahan Jam Layanan', description: 'Layanan CS kami sekarang tersedia 24 jam setiap harinya.' },
    { title: 'Waspada Penipuan', description: 'Kami tidak pernah meminta OTP atau password Anda. Harap berhati-hati terhadap pihak yang mengatasnamakan Outlet Pulsa.' },
    { title: 'Program Referral', description: 'Ajak teman Anda bergabung dan dapatkan komisi Rp 10.000 untuk setiap teman yang mendaftar dan melakukan deposit.' },
    { title: 'Produk Baru: Voucher Game', description: 'Telah tersedia voucher game untuk Mobile Legends, PUBG, dan Free Fire.' },
    { title: 'Cara Transaksi yang Benar', description: 'Pastikan nomor tujuan Anda benar sebelum melakukan transaksi untuk menghindari kegagalan.' },
    { title: 'Syarat dan Ketentuan Terbaru', description: 'Harap membaca pembaruan Syarat dan Ketentuan penggunaan aplikasi Outlet Pulsa.' },
  ];

  const createdNotifs: any[] = [];
  for (const data of notifsData) {
    const notif = await prisma.notif.create({ data });
    createdNotifs.push(notif);
  }

  // Assign read status for member MBR006
  const member = await prisma.member.findFirst({
    where: { kode: 'MBR006' }
  });

  if (member) {
    // Mark first 5 notifs as read
    for (let i = 0; i < 5; i++) {
      await prisma.notifMemberRead.create({
        data: {
          notifId: createdNotifs[i].id,
          memberId: member.id,
        }
      });
    }
    console.log('Seeded NotifMemberRead for MBR006');
  } else {
    console.warn('Member MBR006 not found. Skipping NotifMemberRead seeding.');
  }

  console.log('Seeded 10 Notifs.');
}
