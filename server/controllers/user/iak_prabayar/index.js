const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const controllers = {};

/**
 * Fungsi untuk menampilkan daftar server
 **/
controllers.server_side = async (req, res) => {
  const model_r = new Model_r(req);
  const data = await model_r.server_side();
  res.status(200).json(data);
};

/**
 * Fungsi untuk Mengambil Daftar Operator IAK yang terdapat didalam database
 **/
controllers.get_operator_iak = async (req, res) => {
  const model_r = new Model_r(req);
  const info = await model_r.get_operator_iak();
  // error checking
  if (info.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Operator IAK Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Operator IAK Berhasil Ditemukan",
      data: info.data,
    });
  }
};

/**
 * Fungsi untuk Menghapus koneksi produk IAK dengan Produk
 **/
controllers.delete_koneksi = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    // const body = req.body;
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.delete_koneksi();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Menghapus Koneksi Produk IAK Prabayar Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Menghapus Koneksi Produk IAK Prabayar Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info sinkronisasi produk IAK
 **/
controllers.info_sinkronisasi_produk_iak = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.info_sinkronisasi_produk_iak();
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Info Sinkronisasi Produk IAK Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Info Sinkronisasi Produk IAK Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk melakukan sinkronisasi produk IAK
 **/
controllers.sinkronisasi_produk_iak = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.sinkronisasi_produk_iak();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Sinkronisasi Produk IAK dengan Produk Outlet Pulsa Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Sinkronisasi Produk IAK dengan Produk Outlet Pulsa Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk melakukan update produk prabayar IAK
 **/
controllers.update_produk_prabayar_iak = async (req, res) => {
  const model_r = new Model_r(req);
  const process = await model_r.update_produk_prabayar_iak();
  // error checking
  if (process.error) {
    res.status(400).json({
      error: true,
      error_msg: "Proses Update Produk Prabayar IAK Berhasil Dilakukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Proses Update Produk Prabayar IAK Gagal Dilakukan",
    });
  }
};

module.exports = controllers;
