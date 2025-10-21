const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const Digiflaz = require("../../../library/digiflaz");
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
 * Fungsi untuk menampilkan daftar server
 **/
controllers.info_tes = async (req, res) => {
  const model_r = new Model_r(req);
  const feedBack = await model_r.info_tes();
  if (feedBack.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Berhasil Ditemukan",
      data: feedBack.data,
    });
  }
};

/**
 * Fungsi untuk menampilkan daftar server
 **/
controllers.info_saldo_digiflaz = async (req, res) => {
  const digiflaz = new Digiflaz();
  try {
    await digiflaz.cek_saldo(async (re) => {
      res.status(200).json({
        error: false,
        error_msg: "Data Berhasil Ditemukan",
        data: re.data.saldo,
      });
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Gagal Ditemukan",
    });
  }
};

/**
 * Fungsi untuk menampilkan daftar server
 **/
controllers.get_produk_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const feedBack = await model_r.get_produk_seller();
    if (feedBack.error) {
      res.status(400).json({
        error: true,
        error_msg: "Data Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Berhasil Ditemukan",
        data: feedBack.data,
      });
    }
  }
};

/**
 * Fungsi untuk Menghapus Transaksi Tes
 **/
controllers.delete = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.delete();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Menghapus Transaksi Tes Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menghapus Transaksi Tes Gagal Dilakukan.",
      });
    }
  }
};

controllers.blok_seller_transaksi_tes = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // blok process
    await model_cud.blok_seller_transaksi_tes();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Blok Seller Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Blok Seller Gagal Dilakukan.",
      });
    }
  }
};

controllers.validasi_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // blok process
    await model_cud.validasi_seller();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Validasi Seller Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Validasi Seller Gagal Dilakukan.",
      });
    }
  }
};

//

module.exports = controllers;
