"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Iak_pascabayar_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Iak_pascabayar_product.belongsTo(models.Iak_pascabayar_type, {
        foreignKey: "type_id",
      });
      Iak_pascabayar_product.belongsTo(models.Produk_pascabayar, {
        foreignKey: "produk_pascabayar_id",
      });
    }
  }
  Iak_pascabayar_product.init(
    {
      produk_pascabayar_id: DataTypes.INTEGER,
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      status: DataTypes.ENUM(["active", "non active"]),
      fee: DataTypes.INTEGER,
      komisi: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Iak_pascabayar_product",
    }
  );
  return Iak_pascabayar_product;
};
