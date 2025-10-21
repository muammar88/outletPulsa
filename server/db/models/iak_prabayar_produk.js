"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Iak_prabayar_produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Iak_prabayar_produk.belongsTo(models.Iak_prabayar_operator, {
        foreignKey: "operator_id",
      });
      Iak_prabayar_produk.belongsTo(models.Produk_prabayar, {
        foreignKey: "produk_id",
      });
    }
  }
  Iak_prabayar_produk.init(
    {
      produk_id: DataTypes.INTEGER,
      operator_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      price: DataTypes.INTEGER,
      status: DataTypes.ENUM(["active", "non active"]),
    },
    {
      sequelize,
      modelName: "Iak_prabayar_produk",
    }
  );
  return Iak_prabayar_produk;
};
