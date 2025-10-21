"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Operator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // // define association here
      Operator.belongsTo(models.Kategori, {
        foreignKey: "kategori_id",
      });
      Operator.hasMany(models.Produk_prabayar, {
        foreignKey: "operator_id",
      });
      Operator.hasMany(models.Prefix, {
        foreignKey: "operator_id",
      });
    }
  }
  Operator.init(
    {
      kategori_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Operator",
    }
  );
  return Operator;
};
