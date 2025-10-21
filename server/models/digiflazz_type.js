"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_type.hasMany(models.Digiflazz_product, {
        foreignKey: "type_id",
      });
    }
  }
  Digiflazz_type.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Digiflazz_type",
    }
  );
  return Digiflazz_type;
};
