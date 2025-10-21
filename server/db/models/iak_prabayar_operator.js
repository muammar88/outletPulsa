"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Iak_prabayar_operator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Iak_prabayar_operator.belongsTo(models.Iak_prabayar_type, {
        foreignKey: "type_id",
      });
      Iak_prabayar_operator.hasMany(models.Iak_prabayar_produk, {
        foreignKey: "operator_id",
      });
    }
  }
  Iak_prabayar_operator.init(
    {
      name: DataTypes.STRING,
      type_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Iak_prabayar_operator",
    }
  );
  return Iak_prabayar_operator;
};
