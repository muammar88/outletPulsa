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
 * Fungsi untuk menghapus data member
 **/
controllers.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const body = req.body;
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.delete(body.id);
    // get response
    if (await model_cud.response()) {
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
 * Fungsi untuk mengambil info kostumer agen
 **/
controllers.info_add_kostumer_agen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.info_add_kostumer_agen();
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Data Info Add Kostumer Agen Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Add Kostumer Agen Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk menambahkan kostumer agen
 **/
controllers.add_kostumer_agen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // add new kostumer agen process
    await model_cud.add_kostumer_agen();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Memperbaharui Data Member Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Memperbaharui Data Member Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info pembayaran fee agen
 **/
controllers.info_pembayaran_fee_agen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.info_pembayaran_fee_agen();
    // get response
    if (info.error == false) {
      res.status(200).json({
        error: false,
        error_msg: "Info Pembayaran Fee Berhasil Ditemukan.",
        data: info.data,
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Fee Agen Rp 0 Rupiah.",
      });
    }
  }
};

/**
 * Fungsi untuk melakukan transaksi pembayaran fee agen
 **/
controllers.pembayaran_fee_agen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // add new kostumer agen process
    await model_cud.pembayaran_fee_agen();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Pembayaran Fee Agen Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Pembayaran Fee Agen Gagal Dilakukan.",
      });
    }
  }
};

module.exports = controllers;
