"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_pascabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction_pascabayar.belongsTo(models.Produk_pascabayar, {
        foreignKey: "produk_id",
      });
      Transaction_pascabayar.belongsTo(models.Server, {
        foreignKey: "server_id",
      });
      // Transaction_pascabayar.belongsTo(models.Riwayat_transaksi, {
      //     foreignKey: "riwayatTransaksiId",
      // });
      Transaction_pascabayar.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Transaction_pascabayar.init(
    {
      tr_id: DataTypes.STRING,
      produk_id: DataTypes.INTEGER,
      transaction_id: DataTypes.INTEGER,
      nomor_tujuan: DataTypes.STRING,
      tr_name: DataTypes.STRING,
      ket: DataTypes.TEXT,
      nominal: DataTypes.INTEGER,
      total_nominal: DataTypes.INTEGER,
      admin_fee: DataTypes.INTEGER,
      comission: DataTypes.INTEGER,
      outlet_comission: DataTypes.INTEGER,
      member_comission: DataTypes.INTEGER,
      noref: DataTypes.STRING,
      tarif: DataTypes.STRING,
      daya: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
      kode_agen: DataTypes.STRING,
      laba: DataTypes.INTEGER,
      fee_agen: DataTypes.INTEGER,
      server_id: DataTypes.INTEGER,
      status: DataTypes.ENUM(["proses", "gagal", "sukses", "reverse"]),
    },
    {
      sequelize,
      modelName: "Transaction_pascabayar",
    }
  );
  return Transaction_pascabayar;
};
