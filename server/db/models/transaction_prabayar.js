"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction_prabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction_prabayar.belongsTo(models.Produk_prabayar, {
        foreignKey: "produk_id",
      });
      Transaction_prabayar.belongsTo(models.Server, {
        foreignKey: "server_id",
      });
      //   Transaction.belongsTo(models.Riwayat_transaksi, {
      //     foreignKey: "riwayatTransaksiId",
      //   });
      //   Transaction.hasMany(models.Digiflazz_transaction, {
      //     foreignKey: "transactionId",
      //   });
      // Transaction.hasMany(models.Fee_transaksi_age, {
      //     foreignKey: "transaksiId",
      // });
      Transaction_prabayar.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Transaction_prabayar.init(
    {
      type: DataTypes.ENUM(["prabayar", "pascabayar"]),
      produk_id: DataTypes.INTEGER,
      transaction_id: DataTypes.INTEGER,
      nomor_tujuan: DataTypes.STRING,
      ket: DataTypes.TEXT,
      purchase_price: DataTypes.INTEGER,
      selling_price: DataTypes.INTEGER,
      kode_agen: DataTypes.STRING,
      fee_agen: DataTypes.INTEGER,
      laba: DataTypes.INTEGER,
      server_id: DataTypes.INTEGER,
      status: DataTypes.ENUM(["proses", "gagal", "sukses", "reverse"]),
      trx_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Transaction_prabayar",
    }
  );
  return Transaction_prabayar;
};
