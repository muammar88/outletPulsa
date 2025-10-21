"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Agen extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Agen.hasMany(models.Riwayat_fee_agen, {
        foreignKey: "agen_id",
      });
      Agen.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Agen.init(
    {
      kode: DataTypes.STRING,
      member_id: DataTypes.INTEGER,
      fee: DataTypes.INTEGER,
      tipe_agen: DataTypes.ENUM(["silver", "gold", "platinum"]),
    },
    {
      sequelize,
      modelName: "Agen",
    }
  );
  return Agen;
};
