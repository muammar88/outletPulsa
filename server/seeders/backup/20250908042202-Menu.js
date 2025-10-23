"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil semua tab dari tabel Tabs
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Layanan",
          path: "#",
          icon: "fas fa-exchange",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Keanggotaan",
          path: "#",
          icon: "fas fa-users",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Master Data",
          path: "#",
          icon: "fas fa-database",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Laporan",
          path: "#",
          icon: "fas fa-chart-area",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pengaturan",
          path: "#",
          icon: "fas fa-cogs",
          tab: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Menus", null, {});
  },
};
