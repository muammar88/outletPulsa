"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Produk_pascabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Produk_pascabayar.belongsTo(models.Kategori, {
        foreignKey: "kategori_id",
      });
      Produk_pascabayar.belongsTo(models.Server, {
        foreignKey: "server_id",
      });
      Produk_pascabayar.hasMany(models.Transaction_pascabayar, {
        foreignKey: "produk_id",
      });
      Produk_pascabayar.hasMany(models.Iak_pascabayar_product, {
        foreignKey: "produk_pascabayar_id",
      });
    }
  }
  Produk_pascabayar.init(
    {
      kategori_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      fee: DataTypes.INTEGER,
      comission: DataTypes.INTEGER,
      outletFee: DataTypes.INTEGER,
      server_id: DataTypes.INTEGER,
      status: DataTypes.ENUM(["active", "inactive"]),
    },
    {
      sequelize,
      modelName: "Produk_pascabayar",
    }
  );
  return Produk_pascabayar;
};
