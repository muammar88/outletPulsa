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
 * Fungsi untuk menambahkan kategori
 **/
controllers.add_kategori = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // add new kostumer agen process
    await model_cud.add_kategori();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Menambahkan Kategori Baru Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menambahkan Kategori Baru Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menghapus data kategori
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
        error_msg: "Proses Penghapusan Data Kategori berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Penghapusan Data Kategori gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info kostumer agen
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
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Data Info Edit Kategori Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Edit Kategori Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info pembayaran fee agen
 **/
controllers.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const body = req.body;
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.update(body.id);
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Update Data Kategori berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Update Data Kategori gagal dilakukan.",
      });
    }
  }
};

// /**
//  * Fungsi untuk melakukan transaksi pembayaran fee agen
//  **/
// controllers.pembayaran_fee_agen = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // add new kostumer agen process
//     await model_cud.pembayaran_fee_agen();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Pembayaran Fee Agen Berhasil Dilakukan.",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Pembayaran Fee Agen Gagal Dilakukan.",
//       });
//     }
//   }
// };

module.exports = controllers;
