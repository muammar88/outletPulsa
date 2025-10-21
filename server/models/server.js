"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Server extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Server.hasMany(models.Transaction_prabayar, {
        foreignKey: "server_id",
      });
      Server.hasMany(models.Transaction_pascabayar, {
        foreignKey: "server_id",
      });
      Server.hasMany(models.Produk_prabayar, {
        foreignKey: "server_id",
      });
      Server.hasMany(models.Produk_pascabayar, {
        foreignKey: "server_id",
      });
    }
  }
  Server.init(
    {
      kode: DataTypes.STRING,
      name: DataTypes.STRING,
      status: DataTypes.ENUM(["active", "inactive"]),
    },
    {
      sequelize,
      modelName: "Server",
    }
  );
  return Server;
};
