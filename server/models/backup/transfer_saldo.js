"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transfer_saldo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transfer_saldo.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Transfer_saldo.init(
    {
      transaction_id: DataTypes.INTEGER,
      biaya: DataTypes.INTEGER,
      invoice_terima: DataTypes.STRING,
      nama_penerima: DataTypes.STRING,
      whatsapp_penerima: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Transfer_saldo",
    }
  );
  return Transfer_saldo;
};
