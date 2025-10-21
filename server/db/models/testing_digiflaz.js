"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Testing_digiflaz extends Model {
    static associate(models) {
      Testing_digiflaz.belongsTo(models.Digiflazz_seller, {
        foreignKey: "seller_id",
      });
    }
  }
  Testing_digiflaz.init(
    {
      kode: DataTypes.STRING,
      seller_id: DataTypes.INTEGER,
      produk_name: DataTypes.STRING,
      buyer_sku_kode: DataTypes.STRING,
      nomor_tujuan: DataTypes.STRING,
      harga: DataTypes.INTEGER,
      saldo_before: DataTypes.INTEGER,
      saldo_after: DataTypes.INTEGER,
      status: DataTypes.ENUM(["proses", "gagal", "sukses", "reverse"]),
      waktu_kirim: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Testing_digiflaz",
    }
  );
  return Testing_digiflaz;
};
