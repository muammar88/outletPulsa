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
          name: "Produk Outlet",
          path: "produk_outlet",
          tab: `[{"id":"${tabs[6].id}"},{"id":"${tabs[15].id}"},{"id":"${tabs[2].id}"},{"id":"${tabs[20].id}"}]`,
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          menu_id: menus[2].id,
          name: "Riwayat Transaksi",
          path: "riwayat_transaksi",
          tab: `[{"id":"${tabs[9].id}"}]`,
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          menu_id: menus[3].id,
          name: "Daftar Member",
          path: "daftar_member",
          tab: `[{"id":"${tabs[1].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Pengaturan umum",
          path: "pengaturan_umum",
          tab: `[{"id":"${tabs[13].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Pengaturan Bank",
          path: "pengaturan_bank",
          tab: `[{"id":"${tabs[12].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[5].id,
          name: "Pengguna",
          path: "pengguna",
          tab: `[{"id":"${tabs[3].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Umum",
          path: "laporan_umum",
          tab: `[{"id":"${tabs[11].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Produk IAK",
          path: "produk_iak",
          tab: `[{"id":"${tabs[5].id}"},{"id":"${tabs[14].id}"}]`,
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          menu_id: menus[2].id,
          name: "Riwayat Transfer Saldo",
          path: "riwayat_transfer_saldo",
          tab: `[{"id":"${tabs[19].id}"}]`,
          createdAt: new Date("2023-08-31T00:00:00"),
          updatedAt: new Date("2023-08-31T00:00:00"),
        },
        {
          menu_id: menus[2].id,
          name: "Request Deposit",
          path: "request_deposit",
          tab: `[{"id":"${tabs[17].id}"}]`,
          createdAt: new Date("2023-08-31T00:00:00"),
          updatedAt: new Date("2023-08-31T00:00:00"),
        },
        {
          menu_id: menus[2].id,
          name: "Riwayat Penarikan Laba",
          path: "riwayat_penarikan_laba",
          tab: `[{"id":"${tabs[21].id}"}]`,
          createdAt: new Date("2023-09-01T00:00:00"),
          updatedAt: new Date("2023-09-01T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Transaksi",
          path: "laporan_transaksi",
          tab: `[{"id":"${tabs[10].id}"}]`,
          createdAt: new Date("2023-09-02T00:00:00"),
          updatedAt: new Date("2023-09-02T00:00:00"),
        },
        {
          menu_id: menus[4].id,
          name: "Laporan Member",
          path: "laporan_member",
          tab: `[{"id":"${tabs[23].id}"}]`,
          createdAt: new Date("2023-09-09T00:00:00"),
          updatedAt: new Date("2023-09-09T00:00:00"),
        },
        {
          menu_id: menus[2].id,
          name: "Riwayat Deposit Saldo",
          path: "riwayat_deposit_saldo",
          tab: `[{"id":"${tabs[18].id}"}]`,
          createdAt: new Date("2023-09-10T00:00:00"),
          updatedAt: new Date("2023-09-10T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Produk Tripay",
          path: "produk_tripay",
          tab: `[{"id":"${tabs[7].id}"},{"id":"${tabs[16].id}"}]`,
          createdAt: new Date("2023-08-30T00:00:00"),
          updatedAt: new Date("2023-08-30T00:00:00"),
        },
        {
          menu_id: menus[1].id,
          name: "Produk Digiflazz",
          path: "produk_digiflazz",
          tab: `[{"id":"${tabs[4].id}"},{"id":"${tabs[8].id}"}]`,
          createdAt: new Date("2023-11-21T00:00:00"),
          updatedAt: new Date("2023-11-21T00:00:00"),
        },
        {
          menu_id: menus[3].id,
          name: "Daftar Agen",
          path: "daftar_agen",
          tab: `[{"id":"${tabs[22].id}"}]`,
          createdAt: new Date("2024-01-15T04:06:48"),
          updatedAt: new Date("2024-01-15T04:06:48"),
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
