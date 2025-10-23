"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Iak_pascabayar_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Iak_pascabayar_type.hasMany(models.Iak_pascabayar_product, {
        foreignKey: "type_id",
      });
    }
  }
  Iak_pascabayar_type.init(
    {
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Iak_pascabayar_type",
    }
  );
  return Iak_pascabayar_type;
};
