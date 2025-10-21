"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Submenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Submenu.belongsTo(models.Menu, {
        foreignKey: "menu_id",
      });
    }
  }
  Submenu.init(
    {
      name: DataTypes.STRING,
      path: DataTypes.STRING,
      menu_id: DataTypes.INTEGER,
      tab: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Submenu",
    }
  );
  return Submenu;
};
