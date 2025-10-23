"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Produk_prabayar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Produk_prabayar.belongsTo(models.Operator, {
        foreignKey: "operator_id",
      });
      Produk_prabayar.belongsTo(models.Server, {
        foreignKey: "server_id",
      });
    }
  }
  Produk_prabayar.init(
    {
      operator_id: DataTypes.INTEGER,
      urutan: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      type: DataTypes.ENUM(["prabayar", "pascabayar"]),
      purchase_price: DataTypes.INTEGER,
      markup: DataTypes.INTEGER,
      server_id: DataTypes.INTEGER,
      status: DataTypes.ENUM(["active", "inactive"]),
    },
    {
      sequelize,
      modelName: "Produk_prabayar",
    }
  );
  return Produk_prabayar;
};
