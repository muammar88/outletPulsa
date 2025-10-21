"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Member.hasMany(models.Agen, {
        foreignKey: "member_id",
      });
      Member.hasMany(models.Transaction, {
        foreignKey: "member_id",
      });
      Member.hasMany(models.Request_deposit, {
        foreignKey: "member_id",
      });
      Member.hasMany(models.Otp, {
        foreignKey: "member_id",
      });
    }
  }
  Member.init(
    {
      kode: DataTypes.STRING,
      fullname: DataTypes.STRING,
      whatsapp_number: DataTypes.STRING,
      password: DataTypes.STRING,
      saldo: DataTypes.INTEGER,
      biaya_admin: DataTypes.INTEGER,
      status: DataTypes.ENUM(["unverified", "verified"]),
      type: DataTypes.ENUM(["outletpulsa", "amra"]),
      agen_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Member",
    }
  );
  return Member;
};
