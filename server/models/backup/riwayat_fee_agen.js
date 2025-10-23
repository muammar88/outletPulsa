"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Riwayat_fee_agen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Riwayat_fee_agen.belongsTo(models.Agen, {
        foreignKey: "agen_id",
      });
    }
  }
  Riwayat_fee_agen.init(
    {
      agen_id: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      debet: DataTypes.INTEGER,
      kredit: DataTypes.INTEGER,
      status: DataTypes.ENUM([
        "fee_agen",
        "withdraw_fee_agen",
        "widthdraw_fee_to_saldo",
      ]),
      fee_agen_sebelum: DataTypes.INTEGER,
      fee_agen_sesudah: DataTypes.INTEGER,
      ket: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Riwayat_fee_agen",
    }
  );
  return Riwayat_fee_agen;
};
