"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Request_deposit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Request_deposit.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
      Request_deposit.belongsTo(models.Bank_transfer, {
        foreignKey: "bank_transfer_id",
      });
      Request_deposit.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Request_deposit.init(
    {
      kode: DataTypes.STRING,
      transaction_id: DataTypes.INTEGER,
      member_id: DataTypes.INTEGER,
      nominal: DataTypes.INTEGER,
      nominal_tambahan: DataTypes.INTEGER,
      status: DataTypes.ENUM(["proses", "gagal", "sukses"]),
      bank_transfer_id: DataTypes.INTEGER,
      waktu_request: DataTypes.DATE,
      status_kirim: DataTypes.ENUM(["sudah_kirim", "belum_kirim"]),
      alasan_penolakan: DataTypes.TEXT,
      action_do: DataTypes.ENUM(["member", "admin"]),
      biaya_admin: DataTypes.INTEGER,
      count_penolakan: DataTypes.INTEGER,
      waktu_kirim: DataTypes.DATE,
      waktu_notifikasi: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Request_deposit",
    }
  );
  return Request_deposit;
};
