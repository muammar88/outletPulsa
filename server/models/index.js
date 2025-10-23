"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[
  process.env.NODE_ENV || "development"
];
const db = {};

let sequelize;
if (config.use_env_variable) {
  console.log("++++SSSS+++++Atas");
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  console.log("++++SSSS+++++Bawah");
  console.log(process.env.DB_NAME);
  console.log(process.env.DB_USER);
  console.log(process.env.DB_PASS);
  console.log(process.env.DB_HOST);
  console.log(process.env.DB_PORT);
  console.log(process.env.DB_DIALECT);
  console.log("++++SSSS+++++Bawah");

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || "mysql",
      port: process.env.DB_PORT || 3306,
      logging: console.log,
    }
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Op = Sequelize.Op;

module.exports = db;
