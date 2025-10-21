"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bank_transfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bank_transfer.belongsTo(models.Bank, {
        foreignKey: "bank_id",
      });
      Bank_transfer.hasMany(models.Request_deposit, {
        foreignKey: "bank_transfer_id",
      });
    }
  }
  Bank_transfer.init(
    {
      bank_id: DataTypes.INTEGER,
      account_name: DataTypes.STRING,
      account_number: DataTypes.STRING,
      biaya_admin: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Bank_transfer",
    }
  );
  return Bank_transfer;
};
