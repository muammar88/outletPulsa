const { jwt_value } = require("../../../helpers/jwt");
const { error_msg } = require("../../../helpers/error");
const { info } = require("../../../helpers/user/daftar_member");
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
        error_msg: "Proses Penghapusan Data Member berhasil dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Penghapusan Data Member gagal dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mengambil data member untuk keperluan edit
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
        error_msg: "Data Info Edit Member Gagal Ditemukan",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Edit Member Berhasil Ditemukan",
        data: info.data,
      });
    }
  }
};

/**
 * Fungsi untuk melakkukan update data member
 **/
controllers.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.update();
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
 * Fungsi untuk menjadikan member menjadi sebagai agen
 **/
controllers.become_agen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.become_agen();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Menjadikan Member Sebagai Agen Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menjadikan Member Sebagai Agen Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk mangambil data member untuk keperluan transfer saldo antar member
 **/
controllers.info_transfer_saldo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const body = req.body;
    const model_r = new Model_r(req);
    const list_member = await model_r.info_member(body.id);
    const infos = await info(body.id);
    if (infos.saldo <= 0) {
      res.status(400).json({
        error: true,
        error_msg: "Saldo tidak mencukupi untuk melakukan transfer.",
      });
    } else {
      res.status(200).json({
        error: false,
        error_msg: "Data Info Transfer Saldo Berhasil Ditemukan",
        data: { saldo: infos.saldo, list: list_member },
      });
    }
  }
};

/**
 * Fungsi untuk melakukan transfer saldo antar member
 **/
controllers.transfer_saldo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.transfer_saldo();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Transfer Saldo Antar Member Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Transfer Saldo Antar Member Gagal Dilakukan.",
      });
    }
  }
};

/**
 * Fungsi untuk menambah saldo member
 **/
controllers.tambah_saldo_member = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // delete process
    await model_cud.tambah_saldo();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Tambah Saldo Member Berhasil Dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Tambah Saldo Member Gagal Dilakukan.",
      });
    }
  }
};

module.exports = controllers;
