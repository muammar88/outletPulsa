"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_seller_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_seller_product.belongsTo(models.Digiflazz_product, {
        foreignKey: "product_digiflazz_id",
      });
      Digiflazz_seller_product.belongsTo(models.Digiflazz_seller, {
        foreignKey: "seller_id",
      });
    }
  }
  Digiflazz_seller_product.init(
    {
      product_digiflazz_id: DataTypes.INTEGER,
      seller_id: DataTypes.INTEGER,
      buyerSkuKode: DataTypes.STRING,
      price: DataTypes.INTEGER,
      sellerProductStatus: DataTypes.BOOLEAN,
      startCutOff: DataTypes.TIME,
      endCutOff: DataTypes.TIME,
    },
    {
      sequelize,
      modelName: "Digiflazz_seller_product",
    }
  );
  return Digiflazz_seller_product;
};
