const { error_msg } = require("../../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");
const Model_cud = require("./Model_cud");
const controllers = {};

controllers.server_side;
/**
 * Fungsi untuk menampilkan data server produk pascabayar
 **/
controllers.server_side = async (req, res) => {
  const model_r = new Model_r(req);
  const data = await model_r.server_side();
  res.status(200).json(data);
};

/**
 * Fungsi untuk Mengambil Parameter List Produk Pacabayar
 **/
controllers.get_param_produk_pascabayar = async (req, res) => {
  const model_r = new Model_r(req);
  const info = await model_r.get_param_produk_pascabayar();
  // error checking
  if (info.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Parameter Produk Pascabayar Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Parameter Produk Pascabayar Berhasil Ditemukan",
      data: info.data,
    });
  }
};

// get_info_add_produk_pascabayar
/**
 * Fungsi untuk Mengambil Info Add Produk Pascabayar
 **/
controllers.get_info_add_produk_pascabayar = async (req, res) => {
  const model_r = new Model_r(req);
  const info = await model_r.get_info_add_produk_pascabayar();
  // error checking
  if (info.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Parameter Produk Pascabayar Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Parameter Produk Pascabayar Berhasil Ditemukan",
      data: info.data,
    });
  }
};

/**
 * Fungsi untuk menambahkan Produk Pascabayar
 **/
controllers.add = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // add new produk pascabayar
    await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Menambahkan Produk Pascabayar Baru Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menambahkan Produk Pascabayar Baru Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menghapus data produk pascabayar
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
        error_msg:
          "Proses Penghapusan Data Produk Pascabayar berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Penghapusan Data Produk Pascabayar gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info pascabayar
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
        error_msg: "Data Info Edit Produk Pascabayar Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Edit Produk Pascabayar Berhasil Ditemukan",
        data: { list_kategori: info.data },
        value: info.value,
      });
    }
  }
};

/**
 * Fungsi untuk melakukan update data produk pascabayar
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
        error_msg: "Proses Update Data Produk Pascabayar berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Update Data Produk Pascabayar gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil info markup produk pascabayar
 **/
controllers.get_info_markup_produk_pascabayar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    const info = await model_r.get_info_markup_produk_pascabayar();
    // error checking
    if (info.error) {
      res.status(400).json({
        error: true,
        error_msg: "Data Info Markup Produk Pascabayar Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Markup Produk Pascabayar Berhasil Ditemukan",
        value: info.value,
      });
    }
  }
};

//
/**
 * Fungsi untuk melakukan update markup produk pascabayar
 **/
controllers.update_markup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const body = req.body;
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.update_markup(body.id);
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Update Markup Data Produk Pascabayar berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Update Markup Data Produk Pascabayar gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk melakukan update markup all produk pascabayar
 **/
controllers.update_markup_all_produk = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.update_markup_all_produk();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses Update Markup Seluruh Produk Pascabayar berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses Update Markup Seluruh Produk Pascabayar gagal dilakukan.",
      });
    }
  }
};

//
/**
 * Fungsi untuk melakukan update markup all produk pascabayar
 **/
controllers.update_harga_produk_pascabayar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.update_harga_produk_pascabayar();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Update Harga Produk Pascabayar berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Update Harga Produk Pascabayar gagal dilakukan.",
      });
    }
  }
};

module.exports = controllers;
