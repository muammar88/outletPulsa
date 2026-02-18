"use strict";

const { validationResult } = require("express-validator");

class HandleErrors {
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

  async handleValidationErrors(req, res) {
    const errors = await validationResult(req);

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

      if (!res.headersSent) {
        res.status(400).json({
          error: true,
          message: err_msg.replace(/<br>/g, " "),
        });
      }
      return false;
    } else {
      console.log("-----FFFFFFFFFFFFFFFf-----");
      return true;
    }
  }

  async handleServerError(res, error) {
    if (!res.headersSent) {
      const statusCode = error?.statusCode || 500;
      const message = error?.message;

      res.status(statusCode).json({
        error: true,
        message: message,
      });
    }
  }
}

module.exports = HandleErrors;
