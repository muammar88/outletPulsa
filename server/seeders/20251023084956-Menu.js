"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tabs = await queryInterface.sequelize.query("SELECT id FROM Tabs;", {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (tabs.length === 0) return;

    await queryInterface.bulkInsert(
      "Menus",
      [
        {
          name: "Beranda",
          path: "beranda",
          icon: "fas fa-home",
          tab: `[{"id":"${tabs[0].id}"}]`,
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          name: "Produk",
          path: "#",
          icon: "fas fa-box-open",
          tab: "",
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          name: "Transaksi",
          path: "#",
          icon: "fas fa-compress-arrows-alt",
          tab: "",
          createdAt: new Date("2023-07-28T20:31:23"),
          updatedAt: new Date("2023-07-28T20:31:23"),
        },
        {
          name: "Member",
          path: "#",
          icon: "fas fa-user",
          tab: "",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          name: "Laporan",
          path: "#",
          icon: "fas fa-chart-line",
          tab: "",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
        {
          name: "Pengaturan",
          path: "#",
          icon: "fas fa-cog",
          tab: "",
          createdAt: new Date("2023-08-29T00:00:00"),
          updatedAt: new Date("2023-08-29T00:00:00"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      "Menus",
      {
        path: {
          [Op.in]: [
            "beranda",
            "produk",
            "transaksi",
            "member",
            "laporan",
            "pengaturan",
          ],
        },
      },
      {}
    );
  },
};
