const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const controllers = {};

controllers.server_side;
/**
 * Fungsi untuk menampilkan daftar server
 **/
controllers.server_side = async (req, res) => {
  const model_r = new Model_r(req);
  const data = await model_r.server_side();
  res.status(200).json(data);
};

/**
 * Fungsi untuk Mengambil Daftar Param Digiflaz yang terdapat didalam database
 **/
controllers.get_param_digiflaz = async (req, res) => {
  const model_r = new Model_r(req);
  const info = await model_r.get_param_digiflaz();
  // error checking
  if (info.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Parameter Digiflaz Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Parameter Digiflaz Berhasil Ditemukan",
      data: info.data,
    });
  }
};

/**
 * Fungsi untuk Mengambil info data seller produk
 **/
controllers.get_info_pilih_seller_manual = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.get_info_pilih_seller_manual();
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Info Pilih Seller Digiflaz Manual Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Info Pilih Seller Digiflaz Manual Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk Memilih Seller Serve Digiflaz secara manual
 **/
controllers.pilih_seller_manual = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.pilih_seller_manual();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Memilih Seller Digiflaz Secara Manual Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Memilih Seller Digiflaz Secara Manual Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menghapus koneksi produk digiflaz dengan produk outlet pulsa
 **/
controllers.delete_koneksi_digiflaz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.delete_koneksi_digiflaz();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Menghapus Koneksi Produk Digiflaz dengan Produk Outlet Pulsa Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Menghapus Koneksi Produk Digiflaz dengan Produk Outlet Pulsa Gagal Dilakukan.",
      });
    }
  }
};

controllers.info_sinkronisasi_produk_digiflaz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.info_sinkronisasi_produk_digiflaz();
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Info Sinkronisasi Produk Digiflaz Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Info Sinkronisasi Produk Digiflaz Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk melakukan sinkronisasi produk IAK
 **/
controllers.sinkronisasi_produk_digiflaz = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.sinkronisasi_produk_digiflaz();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Sinkronisasi Produk Digiflaz dengan Produk Outlet Pulsa Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Sinkronisasi Produk Digiflaz dengan Produk Outlet Pulsa Gagal Dilakukan.",
      });
    }
  }
};

controllers.update_produk_digiflazz_prabayar = async (req, res) => {
  const model_r = new Model_r(req);
  const process = await model_r.update_produk_digiflazz_prabayar();
  // error checking
  if (process.error) {
    res.status(400).json({
      error: true,
      error_msg: "Proses Update Produk Pascabayar Digiflaz Berhasil Dilakukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Proses Update Produk Pascabayar Digiflaz Gagal Dilakukan",
    });
  }
};

// /**
//  * Fungsi untuk mengambil info data server
//  **/
// controllers.info_status_server = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.info_server();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Edit Status Server Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Edit Status Server Berhasil Ditemukan",
//         data: info.data.status,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk melakukan perubahan status server
//  **/
// controllers.change_status_server = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // delete process
//     await model_cud.change_status_server();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Mengupdate Status Server Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Mengupdate Status Server gagal dilakukan.",
//       });
//     }
//   }
// };

module.exports = controllers;
