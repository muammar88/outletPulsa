const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const controllers = {};

controllers.server_side;
/**
 * Fungsi untuk menampilkan data server seller
 **/
controllers.server_side = async (req, res) => {
  const model_r = new Model_r(req);
  const data = await model_r.server_side();
  res.status(200).json(data);
};

/**
 * Fungsi untuk mengambil info rangking seller
 **/
controllers.get_info_rangking_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.get_info_rangking_seller();
    // get response
    if (info.error == false) {
      res.status(200).json({
        error: false,
        error_msg: "Info Rangking Seller Berhasil Ditemukan.",
        data: info.data,
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Info Rangking Seller Gagal Ditemukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengupdate rangking seller
 **/
controllers.update_rangking_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // update rangking seller
    await model_cud.update_rangking_seller();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Memperbaharui Data Rangking Seller Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Memperbaharui Data Rangking Seller Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk memblokir seller
 **/
controllers.blokir_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // update blokir seller
    await model_cud.blokir_seller();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Blokir Seller Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Blokir Seller Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk membuka blokir seller
 **/
controllers.buka_blokir_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // update buka blokir seller
    await model_cud.buka_blokir_seller();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Membuka Blokir Seller Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Membuka Blokir Seller Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menghapus seller
 **/
controllers.delete_seller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // process delete seller
    await model_cud.delete_seller();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Delete Seller Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Delete Seller Gagal Dilakukan.",
      });
    }
  }
};

module.exports = controllers;
