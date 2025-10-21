"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tripay_prabayar_operator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tripay_prabayar_operator.belongsTo(models.Tripay_prabayar_kategori, {
        foreignKey: "kategori_id",
      });
      Tripay_prabayar_operator.hasMany(models.Tripay_prabayar_produk, {
        foreignKey: "operator_id",
      });
    }
  }
  Tripay_prabayar_operator.init(
    {
      kategori_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Tripay_prabayar_operator",
    }
  );
  return Tripay_prabayar_operator;
};
