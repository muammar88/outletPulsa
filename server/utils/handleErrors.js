"use strict";

const { validationResult } = require("express-validator");

class HandleErrors {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async message_process(errors) {
    let num = 0;
    let message = "";

    errors.array().forEach((error) => {
      if (num != 0) message += "<br>";
      message += error.msg;
      num++;
    });
    return message;
  }

  async handleValidationErrors() {
    const errors = validationResult(this.req);

    console.log("-----SSSSValidation Errors-----");
    console.log(errors);
    console.log(errors.isEmpty());
    console.log("-----SSSSValidation Errors-----");
    if (!errors.isEmpty()) {
      console.log("-----SSSSValidation Errors-----WWWWWWWWWWWWW");
      const err_msg = await this.message_process(errors);

      console.log("-----Validation Errors-----");
      console.log(err_msg);
      console.log("-----Validation Errors-----");

      if (!this.res.headersSent) {
        this.res.status(400).json({
          error: true,
          message: err_msg.replace(/<br>/g, " "),
        });
      }
      return false;
    } else {
      return true;
    }
  }

  async handleServerError(error) {
    if (!this.res.headersSent) {
      const statusCode = error?.statusCode || 500;
      const message = error?.message;

      this.res.status(statusCode).json({
        error: true,
        message: message,
      });
    }
  }
}

module.exports = HandleErrors;
