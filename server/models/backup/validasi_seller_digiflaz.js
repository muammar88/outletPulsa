"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Validasi_seller_digiflaz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Validasi_seller_digiflaz.belongsTo(models.Digiflazz_seller, {
        foreignKey: "seller_id",
      });
    }
  }
  Validasi_seller_digiflaz.init(
    {
      seller_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Validasi_seller_digiflaz",
    }
  );
  return Validasi_seller_digiflaz;
};
