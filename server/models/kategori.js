"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Kategori.hasMany(models.Operator, {
        foreignKey: "kategori_id",
      });
      Kategori.hasMany(models.Produk_pascabayar, {
        foreignKey: "kategori_id",
      });
    }
  }
  Kategori.init(
    {
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      type: DataTypes.ENUM(["prabayar", "pascabayar"]),
    },
    {
      sequelize,
      modelName: "Kategori",
    }
  );
  return Kategori;
};
