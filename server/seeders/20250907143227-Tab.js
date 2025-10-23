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
            "Halaman beranda yang menampilkan ringkasan informasi, notifikasi, dan akses cepat ke fitur.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Member",
          title: "Daftar Member",
          icon: "fa-solid fa-users",
          path: "daftar_member",
          description:
            "Menampilkan daftar member yang terdaftar beserta detail, status, dan opsi manajemen.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Operator Outlet",
          title: "Daftar Operator Outlet",
          icon: "fa-solid fa-user-gear",
          path: "daftar_operator_outlet",
          description:
            "Menampilkan daftar operator outlet beserta peran dan status akses mereka.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Pengguna",
          title: "Daftar Pengguna",
          icon: "fa-solid fa-user",
          path: "daftar_pengguna",
          description:
            "Menampilkan daftar pengguna sistem untuk pengelolaan akun dan hak akses.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Digiflazz",
          title: "Daftar Produk Digiflazz",
          icon: "fa-brands fa-digital-ocean",
          path: "daftar_produk_digiflazz",
          description:
            "Daftar produk dari Digiflazz yang tersedia untuk dipasarkan oleh outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk IAK",
          title: "Daftar Produk IAK",
          icon: "fa-solid fa-box",
          path: "daftar_produk_iak",
          description:
            "Daftar produk IAK yang tersedia untuk transaksi, lengkap dengan harga dan kode.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Outlet",
          title: "Daftar Produk Outlet",
          icon: "fa-solid fa-store",
          path: "daftar_produk_outlet",
          description:
            "Daftar produk yang dimiliki atau dijual oleh outlet, termasuk stok dan harga.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Produk Tripay",
          title: "Daftar Produk Tripay",
          icon: "fa-solid fa-wallet",
          path: "daftar_produk_tripay",
          description:
            "Daftar produk yang disediakan melalui Tripay untuk digunakan outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Seller",
          title: "Daftar Seller",
          icon: "fa-solid fa-store-front",
          path: "daftar_seller",
          description:
            "Menampilkan daftar seller/penjual beserta informasi toko dan kontak.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Daftar Transaksi",
          title: "Daftar Transaksi",
          icon: "fa-solid fa-receipt",
          path: "daftar_transaksi",
          description:
            "Menampilkan daftar transaksi lengkap dengan status, nominal, dan riwayat.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan Transaksi",
          title: "Laporan Transaksi",
          icon: "fa-solid fa-chart-column",
          path: "laporan_transaksi",
          description:
            "Laporan detail transaksi dengan filter tanggal, tipe, dan ringkasan statistik.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan Umum",
          title: "Laporan Umum",
          icon: "fa-solid fa-file-lines",
          path: "laporan_umum",
          description:
            "Laporan rekapitulasi umum tentang performa, pendapatan, dan statistik aplikasi.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pengaturan Bank",
          title: "Pengaturan Bank",
          icon: "fa-solid fa-building-columns",
          path: "pengaturan_bank",
          description:
            "Pengaturan dan daftar rekening bank yang digunakan untuk deposit dan transfer.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pengaturan Umum",
          title: "Pengaturan Umum",
          icon: "fa-solid fa-gear",
          path: "pengaturan_umum",
          description:
            "Pengaturan umum aplikasi, termasuk konfigurasi tampilan dan preferensi sistem.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk IAK Pascabayar",
          title: "Produk IAK Pascabayar",
          icon: "fa-solid fa-credit-card",
          path: "produk_iak_pascabayar",
          description:
            "Daftar produk pascabayar dari IAK beserta informasi harga dan kode produk.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk Pascabayar Outlet",
          title: "Produk Pascabayar Outlet",
          icon: "fa-solid fa-receipt",
          path: "produk_pascabayar_outlet",
          description:
            "Daftar produk pascabayar yang disediakan outlet untuk pelanggan.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Produk Tripay Pascabayar",
          title: "Produk Tripay Pascabayar",
          icon: "fa-solid fa-money-bill-transfer",
          path: "produk_tripay_pascabayar",
          description:
            "Daftar produk pascabayar yang disediakan melalui Tripay untuk outlet.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Request Deposit",
          title: "Request Deposit",
          icon: "fa-solid fa-upload",
          path: "request_deposit",
          description:
            "Formulir dan daftar permintaan deposit saldo yang diajukan oleh pengguna.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riwayat Deposit Saldo",
          title: "Riwayat Deposit Saldo",
          icon: "fa-solid fa-wallet",
          path: "riwayat_deposit_saldo",
          description:
            "Menampilkan riwayat top-up/deposit saldo termasuk bukti dan status.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riwayat Transfer Saldo",
          title: "Riwayat Transfer Saldo",
          icon: "fa-solid fa-exchange-alt",
          path: "riwayat_transfer_saldo",
          description:
            "Riwayat pemindahan saldo antar akun atau agen beserta status dan nominal.",
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
            "laporan_umum",
            "pengaturan_bank",
            "pengaturan_umum",
            "produk_iak_pascabayar",
            "produk_pascabayar_outlet",
            "produk_tripay_pascabayar",
            "request_deposit",
            "riwayat_deposit_saldo",
            "riwayat_transfer_saldo",
          ],
        },
      },
      {}
    );
  },
};
