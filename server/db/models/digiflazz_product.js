"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_product.belongsTo(models.Digiflazz_category, {
        foreignKey: "category_id",
      });
      Digiflazz_product.belongsTo(models.Digiflazz_brand, {
        foreignKey: "brand_id",
      });
      Digiflazz_product.belongsTo(models.Digiflazz_type, {
        foreignKey: "type_id",
      });
      Digiflazz_product.belongsTo(models.Produk_prabayar, {
        foreignKey: "produk_id",
      });
      Digiflazz_product.hasMany(models.Digiflazz_seller_product, {
        foreignKey: "product_digiflazz_id",
      });
      Digiflazz_product.hasMany(models.Digiflazz_transaction, {
        foreignKey: "product_digiflazz_id",
      });
    }
  }

  Digiflazz_product.init(
    {
      name: DataTypes.STRING,
      produk_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      brand_id: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      selectedSellerBuyerSkuKode: DataTypes.STRING,
      selectedSellerPrice: DataTypes.INTEGER,
      selectedSellerStartCutOff: DataTypes.TIME,
      selectedSellerEndCutOff: DataTypes.TIME,
      status: DataTypes.ENUM(["active", "inactive"]),
    },
    {
      sequelize,
      modelName: "Digiflazz_product",
    }
  );
  return Digiflazz_product;
};
