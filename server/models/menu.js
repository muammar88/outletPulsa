"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Menu.hasMany(models.Submenu, {
        foreignKey: "menu_id",
      });
    }
  }
  Menu.init(
    {
      name: DataTypes.STRING,
      path: DataTypes.STRING,
      icon: DataTypes.STRING,
      tab: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Menu",
    }
  );
  return Menu;
};
