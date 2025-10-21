"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //   Transaction.belongsTo(models.Member, {
      //     foreignKey: "memberId",
      //   });
      // Riwayat_transaksi.hasMany(models.Request_deposit, {
      //     foreignKey: "riwayatTransaksiId",
      // });
      // Riwayat_transaksi.hasMany(models.Transaction_pascabayar, {
      //     foreignKey: "riwayatTransaksiId",
      // });
      // Riwayat_transaksi.hasMany(models.Amra_rental_fee, {
      //     foreignKey: "riwayatTransaksiId",
      // });
      Transaction.hasMany(models.Request_deposit, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Transaction_prabayar, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Transaction_pascabayar, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Transfer_saldo, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Terima_saldo, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Transaction_deposit_fee_agen, {
        foreignKey: "transaction_id",
      });
      Transaction.hasMany(models.Transaction_deposit, {
        foreignKey: "transaction_id",
      });
      Transaction.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Transaction.init(
    {
      kode: DataTypes.STRING,
      member_id: DataTypes.INTEGER,
      tipe: DataTypes.ENUM([
        "deposit_fee_agen",
        "deposit",
        "beli_produk_prabayar",
        "beli_produk_pascabayar",
        "rental_amra",
        "transfer_saldo",
        "terima_saldo",
      ]),
      saldo_before: DataTypes.INTEGER,
      saldo_after: DataTypes.INTEGER,
      ket: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
