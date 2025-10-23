"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Digiflazz_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Digiflazz_transaction.belongsTo(models.Digiflazz_product, {
        foreignKey: "product_digiflazz_id",
      });
      Digiflazz_transaction.belongsTo(models.Digiflazz_seller, {
        foreignKey: "seller_id",
      });
      Digiflazz_transaction.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Digiflazz_transaction.init(
    {
      transaction_id: DataTypes.INTEGER,
      product_digiflazz_id: DataTypes.INTEGER,
      seller_id: DataTypes.INTEGER,
      buyerSkuCode: DataTypes.STRING,
      status: DataTypes.ENUM(["proses", "sukses", "gagal"]),
      requestTime: DataTypes.DATE,
      responseTime: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Digiflazz_transaction",
    }
  );
  return Digiflazz_transaction;
};
