const fs = require("fs");
const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const controllers = {};

controllers.server_side;
/**
 * Fungsi untuk menampilkan data server member
 **/
controllers.server_side = async (req, res) => {
  const model_r = new Model_r(req);
  const data = await model_r.server_side();
  res.status(200).json(data);
};

/**
 * Fungsi untuk menghapus data bank
 **/
controllers.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const data = await model_r.m_info_bank();
    const body = req.body;
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.delete(body.id);
    // get response
    if (await model_cud.response()) {
      // delete photo lama
      if (data.error == false) {
        const oldFile = process.cwd() + "/public/img/bank/" + data.data.image;
        await fs.unlink(oldFile, function (err) {
          if (err) {
            console.log("File lama gagal dihapus");
          }
        });
      }
      res.status(200).json({
        error: false,
        error_msg: "Proses Penghapusan Data Agen berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Penghapusan Data Agen gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menambahkan Bank baru
 **/
controllers.add = async (req, res) => {
  const errors = validationResult(req);
  if (req.file == undefined) {
    errors.push = {
      value: "",
      msg: "Photo Bank Wajib Diupload.",
      param: "file",
      location: "body",
    };
  }
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // add new bank process
    await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Menambahkan Data Bank Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menambahkan Data Bank Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info edit bank
 **/
controllers.info_edit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.info_edit();
    // get response
    if (info.error == false) {
      res.status(200).json({
        error: false,
        error_msg: "Info Bank Berhasil Ditemukan.",
        value: info.value,
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Info Bank Gagal Ditemukan.",
      });
    }
  }
};

/**
 * Fungsi untuk melakukan update data bank
 **/
controllers.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const data = await model_r.m_info_bank();
    const model_cud = new Model_cud(req);
    // update data bank process
    await model_cud.update();
    // get response
    if (await model_cud.response()) {
      if (req.file != undefined) {
        // delete photo lama
        if (data.error == false) {
          const oldFile = process.cwd() + "/public/img/bank/" + data.data.image;
          await fs.unlink(oldFile, function (err) {
            if (err) {
              console.log("File lama gagal dihapus");
            }
          });
        }
      }
      res.status(200).json({
        error: false,
        error_msg: "Proses Update Data Bank Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Update Data Bank Gagal Dilakukan.",
      });
    }
  }
};

module.exports = controllers;
