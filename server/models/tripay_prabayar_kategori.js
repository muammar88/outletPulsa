"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tripay_prabayar_kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tripay_prabayar_kategori.hasMany(models.Tripay_prabayar_operator, {
        foreignKey: "kategori_id",
      });
    }
  }
  Tripay_prabayar_kategori.init(
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Tripay_prabayar_kategori",
    }
  );
  return Tripay_prabayar_kategori;
};
