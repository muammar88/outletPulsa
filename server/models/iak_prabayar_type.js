"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Iak_prabayar_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Iak_prabayar_type.hasMany(models.Iak_prabayar_operator, {
        foreignKey: "type_id",
      });
    }
  }
  Iak_prabayar_type.init(
    {
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Iak_prabayar_type",
    }
  );
  return Iak_prabayar_type;
};
