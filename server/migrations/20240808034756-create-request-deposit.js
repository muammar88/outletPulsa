"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Request_deposits", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Transactions",
          key: "id",
        },
      },
      member_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Members",
          key: "id",
        },
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      nominal_tambahan: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["proses", "gagal", "sukses"],
      },
      bank_transfer_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Bank_transfers",
          key: "id",
        },
      },
      waktu_request: {
        type: Sequelize.DATE,
      },
      status_kirim: {
        type: Sequelize.ENUM,
        values: ["sudah_kirim", "belum_kirim"],
      },
      alasan_penolakan: {
        type: Sequelize.TEXT,
      },
      action_do: {
        type: Sequelize.ENUM,
        values: ["member", "admin"],
      },
      biaya_admin: {
        type: Sequelize.INTEGER,
      },
      count_penolakan: {
        type: Sequelize.INTEGER,
      },
      waktu_kirim: {
        type: Sequelize.DATE,
      },
      waktu_notifikasi: {
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
    await queryInterface.dropTable("Request_deposits");
  },
};
