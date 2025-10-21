"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tripay_prabayar_produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tripay_prabayar_produk.belongsTo(models.Tripay_prabayar_operator, {
        foreignKey: "operator_id",
      });
      Tripay_prabayar_produk.belongsTo(models.Produk_prabayar, {
        foreignKey: "produk_id",
      });
    }
  }
  Tripay_prabayar_produk.init(
    {
      produk_id: DataTypes.INTEGER,
      operator_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      deskripsi: DataTypes.TEXT,
      status: DataTypes.ENUM(["tersedia", "tidak tersedia"]),
    },
    {
      sequelize,
      modelName: "Tripay_prabayar_produk",
    }
  );
  return Tripay_prabayar_produk;
};
