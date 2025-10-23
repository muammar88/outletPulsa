"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Digiflazz_transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions",
          key: "id",
        },
      },
      product_digiflazz_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Digiflazz_products",
          key: "id",
        },
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Digiflazz_sellers",
          key: "id",
        },
      },
      buyerSkuCode: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["proses", "sukses", "gagal"],
        defaultValue: "proses",
      },
      requestTime: {
        type: Sequelize.DATE,
      },
      responseTime: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Digiflazz_transactions");
  },
};
