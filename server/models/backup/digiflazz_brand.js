"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_brand.hasMany(models.Digiflazz_product, {
        foreignKey: "brand_id",
      });
    }
  }
  Digiflazz_brand.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Digiflazz_brand",
    }
  );
  return Digiflazz_brand;
};
