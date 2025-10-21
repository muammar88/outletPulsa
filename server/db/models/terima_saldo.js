"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Terima_saldo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Terima_saldo.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Terima_saldo.init(
    {
      transaction_id: DataTypes.INTEGER,
      biaya: DataTypes.INTEGER,
      invoice_transfer: DataTypes.STRING,
      nama_pengirim: DataTypes.STRING,
      whatsapp_pengirim: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Terima_saldo",
    }
  );
  return Terima_saldo;
};
