"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_category.hasMany(models.Digiflazz_product, {
        foreignKey: "category_id",
      });
    }
  }
  Digiflazz_category.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Digiflazz_category",
    }
  );
  return Digiflazz_category;
};
