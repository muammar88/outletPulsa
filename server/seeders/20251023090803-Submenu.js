"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil semua menu dari tabel Menus
    const menus = await queryInterface.sequelize.query(
      "SELECT id FROM Menus;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (menus.length === 0) return;

    // Ambil semua tab dari tabel Tabs
    const tabs = await queryInterface.sequelize.query("SELECT id FROM Tabs;", {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (tabs.length === 0) return;

    await queryInterface.bulkInsert(
      "Submenus",
      [
        {
          menu_id: menus[1].id,
          name: "Daftar Produk",
          path: "daftar_produk_outlet",
          tab: `[{"id":"${tabs[6].id}"},{"id":"${tabs[15].id}"},{"id":"${tabs[2].id}"}]`,
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          menu_id: menus[2].id,
          name: "Daftar Transaksi",
          path: "daftar_transaksi",
          tab: `[{"id":"${tabs[9].id}"}]`,
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          menu_id: menus[1].id,
          name: "Daftar Operator",
          path: "daftar_operator_outlet",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Produk Pascabayar",
          path: "produk_pascabayar_outlet",
          createdAt: new Date("2023-09-24T00:00:00"),
          updatedAt: new Date("2023-09-24T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Daftar Member",
          path: "daftar_member",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Pengaturan umum",
          path: "pengaturan_umum",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Pengaturan Bank",
          path: "pengaturan_bank",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Daftar Pengguna",
          path: "daftar_pengguna",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Umum",
          path: "laporan_umum",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Daftar Produk IAK",
          path: "daftar_produk_iak",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Riwayat Transfer Saldo",
          path: "riwayat_transfer_saldo",
          createdAt: new Date("2023-08-31T00:00:00"),
          updatedAt: new Date("2023-08-31T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Request Deposit",
          path: "request_deposit",
          createdAt: new Date("2023-08-31T00:00:00"),
          updatedAt: new Date("2023-08-31T00:00:00"),
        },
        {
          menu_id: menus[2].id,
          name: "Riwayat Penarikan Laba",
          path: "riwayat_penarikan_laba",
          createdAt: new Date("2023-09-01T00:00:00"),
          updatedAt: new Date("2023-09-01T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Transaksi",
          path: "laporan_transaksi",
          createdAt: new Date("2023-09-02T00:00:00"),
          updatedAt: new Date("2023-09-02T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Member",
          path: "laporan_member",
          createdAt: new Date("2023-09-09T00:00:00"),
          updatedAt: new Date("2023-09-09T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Riwayat Deposit Saldo",
          path: "riwayat_deposit_saldo",
          createdAt: new Date("2023-09-10T00:00:00"),
          updatedAt: new Date("2023-09-10T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Produk IAK Pascabayar",
          path: "produk_iak_pascabayar",
          createdAt: new Date("2023-09-24T00:00:00"),
          updatedAt: new Date("2023-09-24T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Daftar Produk Tripay",
          path: "daftar_produk_tripay",
          createdAt: new Date("2023-08-30T00:00:00"),
          updatedAt: new Date("2023-08-30T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Daftar Produk Digiflazz",
          path: "daftar_produk_digiflazz",
          createdAt: new Date("2023-11-21T00:00:00"),
          updatedAt: new Date("2023-11-21T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Daftar Agen",
          path: "daftar_agen",
          createdAt: new Date("2024-01-15T04:06:48"),
          updatedAt: new Date("2024-01-15T04:06:48"),
        },
        {
          menu_id: menus[1].id,
          name: "Daftar Seller",
          path: "daftar_seller",
          createdAt: new Date("2024-01-24T15:16:52"),
          updatedAt: new Date("2024-01-24T15:16:52"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      "Submenus",
      {
        path: {
          [Op.in]: [
            "daftar_produk_outlet",
            "daftar_transaksi",
            "daftar_operator_outlet",
            "produk_pascabayar_outlet",
            "daftar_member",
            "pengaturan_umum",
            "pengaturan_bank",
            "daftar_pengguna",
            "laporan_umum",
            "daftar_produk_iak",
            "riwayat_transfer_saldo",
            "request_deposit",
            "riwayat_penarikan_laba",
            "laporan_transaksi",
            "laporan_member",
            "riwayat_deposit_saldo",
            "produk_iak_pascabayar",
            "daftar_produk_tripay",
            "daftar_produk_digiflazz",
            "daftar_agen",
            "daftar_seller",
          ],
        },
      },
      {}
    );
  },
};
