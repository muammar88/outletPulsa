"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Tabs",
      [
        {
          name: "Beranda",
          title: "Beranda",
          icon: "fa-solid fa-house",
          path: "beranda",
          description:
            "Ringkasan dashboard outlet: saldo, transaksi terbaru, dan akses cepat ke fitur utama.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Member",
          title: "Daftar Member",
          icon: "fa-solid fa-users",
          path: "daftar_member",
          description:
            "Kelola data member: profil, status, dan riwayat transaksi.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Operator Outlet",
          title: "Daftar Operator Outlet",
          icon: "fa-solid fa-user-gear",
          path: "daftar_operator_outlet",
          description:
            "Kelola operator outlet termasuk peran dan akses mereka.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Pengguna",
          title: "Daftar Pengguna",
          icon: "fa-solid fa-user",
          path: "daftar_pengguna",
          description: "Kelola akun pengguna sistem dan hak akses.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Digiflazz",
          title: "Daftar Produk Digiflazz",
          icon: "fa-brands fa-digital-ocean",
          path: "daftar_produk_digiflazz",
          description:
            "Daftar produk Digiflazz yang tersedia untuk dijual oleh outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk IAK",
          title: "Daftar Produk IAK",
          icon: "fa-solid fa-box",
          path: "daftar_produk_iak",
          description:
            "Daftar produk IAK beserta kode, harga, dan status ketersediaan.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Outlet",
          title: "Daftar Produk Outlet",
          icon: "fa-solid fa-store",
          path: "daftar_produk_outlet",
          description:
            "Produk yang dimiliki atau dijual oleh outlet, termasuk stok dan harga.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Tripay",
          title: "Daftar Produk Tripay",
          icon: "fa-solid fa-wallet",
          path: "daftar_produk_tripay",
          description:
            "Daftar produk yang disediakan melalui Tripay untuk outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Seller",
          title: "Daftar Seller",
          icon: "fa-solid fa-store",
          path: "daftar_seller",
          description:
            "Informasi seller/penjual termasuk nama toko dan kontak.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Transaksi",
          title: "Daftar Transaksi",
          icon: "fa-solid fa-receipt",
          path: "daftar_transaksi",
          description:
            "Riwayat transaksi lengkap: status, nominal, dan detail.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan Transaksi",
          title: "Laporan Transaksi",
          icon: "fa-solid fa-chart-column",
          path: "laporan_transaksi",
          description:
            "Laporan transaksi dengan filter tanggal dan ringkasan statistik.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan Umum",
          title: "Laporan Umum",
          icon: "fa-solid fa-file-lines",
          path: "laporan_umum",
          description:
            "Laporan rekap performa, pendapatan, dan metrik penting.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pengaturan Bank",
          title: "Pengaturan Bank",
          icon: "fa-solid fa-building-columns",
          path: "pengaturan_bank",
          description:
            "Atur rekening bank untuk deposit dan penerimaan pembayaran.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pengaturan Umum",
          title: "Pengaturan Umum",
          icon: "fa-solid fa-gear",
          path: "pengaturan_umum",
          description: "Pengaturan sistem dan preferensi aplikasi.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk IAK Pascabayar",
          title: "Produk IAK Pascabayar",
          icon: "fa-solid fa-credit-card",
          path: "produk_iak_pascabayar",
          description:
            "Produk pascabayar IAK yang tersedia untuk transaksi outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk Pascabayar Outlet",
          title: "Produk Pascabayar Outlet",
          icon: "fa-solid fa-receipt",
          path: "produk_pascabayar_outlet",
          description:
            "Produk pascabayar yang disediakan outlet untuk pelanggan.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk Tripay Pascabayar",
          title: "Produk Tripay Pascabayar",
          icon: "fa-solid fa-money-bill-transfer",
          path: "produk_tripay_pascabayar",
          description: "Produk pascabayar melalui Tripay untuk outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Request Deposit",
          title: "Request Deposit",
          icon: "fa-solid fa-upload",
          path: "request_deposit",
          description:
            "Form dan daftar permintaan deposit saldo oleh pengguna.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riwayat Deposit Saldo",
          title: "Riwayat Deposit Saldo",
          icon: "fa-solid fa-wallet",
          path: "riwayat_deposit_saldo",
          description:
            "Riwayat top-up/deposit saldo lengkap dengan bukti dan status.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riwayat Transfer Saldo",
          title: "Riwayat Transfer Saldo",
          icon: "fa-solid fa-exchange-alt",
          path: "riwayat_transfer_saldo",
          description: "Riwayat pemindahan saldo antar akun atau agen.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Kategori",
          title: "Daftar Kategori",
          icon: "fa-solid fa-exchange-alt",
          path: "daftar_kategori",
          description:
            "Kelola kategori produk untuk pengelompokan dan pencarian.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riwayat Penarikan Laba",
          title: "Riwayat Penarikan Laba",
          icon: "fa-solid fa-file-invoice-dollar",
          path: "riwayat_penarikan_laba",
          description:
            "Riwayat penarikan laba oleh agen/outlet beserta nominal dan status.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Agen",
          title: "Daftar Agen",
          icon: "fa-solid fa-people-group",
          path: "daftar_agen",
          description:
            "Daftar agen terdaftar: profil, kontak, dan status akun agen.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan Member",
          title: "Laporan Member",
          icon: "fa-solid fa-file-lines",
          path: "laporan_member",
          description:
            "Laporan aktivitas member: pendaftaran, transaksi, dan statistik keanggotaan.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      "Tabs",
      {
        path: {
          [Op.in]: [
            "beranda",
            "daftar_member",
            "daftar_operator_outlet",
            "daftar_pengguna",
            "daftar_produk_digiflazz",
            "daftar_produk_iak",
            "daftar_produk_outlet",
            "daftar_produk_tripay",
            "daftar_seller",
            "daftar_transaksi",
            "laporan_transaksi",
            "laporan_member",
            "laporan_umum",
            "pengaturan_bank",
            "pengaturan_umum",
            "produk_iak_pascabayar",
            "produk_pascabayar_outlet",
            "produk_tripay_pascabayar",
            "request_deposit",
            "riwayat_deposit_saldo",
            "riwayat_transfer_saldo",
            "riwayat_penarikan_laba",
          ],
        },
      },
      {}
    );
  },
};
