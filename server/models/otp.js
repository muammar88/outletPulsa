"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Otp.belongsTo(models.Member, {
        foreignKey: "member_id",
      });
    }
  }
  Otp.init(
    {
      member_id: DataTypes.INTEGER,
      nomor_tujuan: DataTypes.STRING,
      otp: DataTypes.STRING,
      type: DataTypes.ENUM(["register", "login", "edit_data_member"]),
    },
    {
      sequelize,
      modelName: "Otp",
    }
  );
  return Otp;
};
