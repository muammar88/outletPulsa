const fs = require("fs");
// const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");

const frontend = require("../../helpers/frontend");

const { validationResult } = require("express-validator");

const controllers = {};

controllers.main = async (req, res) => {
  // var testimoni = await frontend.get_testimoni_frontendFn();
  // var contact = await frontend.contactFn();
  // var sosial_media = await frontend.sosial_mediaFN();

  res.render("frontend/index", {});
};

controllers.login = async (req, res) => {
  res.render("frontend/login");
};

module.exports = controllers;
