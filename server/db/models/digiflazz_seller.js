"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_seller extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_seller.hasMany(models.Digiflazz_seller_product, {
        foreignKey: "seller_id",
      });
      Digiflazz_seller.hasMany(models.Digiflazz_transaction, {
        foreignKey: "seller_id",
      });
      Digiflazz_seller.hasMany(models.Testing_digiflaz, {
        foreignKey: "seller_id",
      });
      Digiflazz_seller.hasMany(models.Validasi_seller_digiflaz, {
        foreignKey: "seller_id",
      });
    }
  }
  Digiflazz_seller.init(
    {
      name: DataTypes.STRING,
      status: DataTypes.ENUM(["banned", "unbanned"]),
      rangking: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Digiflazz_seller",
    }
  );
  return Digiflazz_seller;
};
