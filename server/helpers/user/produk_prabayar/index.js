const {
  Op,
  Produk_prabayar,
  Kategori,
  Operator,
  Server,
  Iak_prabayar_produk,
  Tripay_prabayar_produk,
  Digiflazz_product,
} = require("../../../db/models");

const helper = {};

helper.check_operator_id = async (value) => {
  if (value != 0) {
    check = await Operator.findOne({
      where: { id: value },
    });
    if (!check) {
      throw new Error("Operator ID Tidak Terdaftar Dipangkalan Data.");
    }
  }
  return true;
};

helper.check_server_id = async (value) => {
  if (value != 0) {
    check = await Server.findOne({
      where: { id: value },
    });
    if (!check) {
      throw new Error("Server ID Tidak Terdaftar Dipangkalan Data.");
    }
  }
  return true;
};

helper.info_produk = async (id) => {
  var list = {};
  await Produk_prabayar.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["name"] = val.name;
    }
  });
  return list;
};

helper.check_kategori_id = async (id) => {
  if (id != 0) {
    var check = await Kategori.findOne({
      where: { id: id },
    });
    if (!check) {
      throw new Error("ID Kategori Tidak Terdaftar Dipangkalan Data.");
    }
  }

  return true;
};

helper.check_produk_id = async (id) => {
  var check = await Produk_prabayar.findOne({
    where: { id: id },
  });
  if (!check) {
    throw new Error("ID Produk Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_kategori_id = async (id) => {
  if (id != 0) {
    var check = await Kategori.findOne({
      where: { id: id },
    });
    if (!check) {
      throw new Error("ID Kategori Tidak Terdaftar Dipangkalan Data.");
    }
  }

  return true;
};

helper.check_operator_id_produk_prabayar = async (operator_id) => {
  var check = await Operator.findOne({
    where: { id: operator_id },
  });
  if (!check) {
    throw new Error("ID Operator Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_kode_produk_prabayar = async (kode, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Produk_prabayar.findOne({
      where: { kode: kode, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Produk_prabayar.findOne({
      where: { kode: kode },
    });
  }
  if (check) {
    throw new Error("Kode Produk Prabayar Sudah Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.server_price = async (id, server_id) => {
  var price = 0;
  if (server_id == 1) {
    await Iak_prabayar_produk.findOne({
      where: { produk_id: id },
    }).then(async (val) => {
      if (val) {
        price = val.price;
      }
    });
  } else if (server_id == 2) {
    await Tripay_prabayar_produk.findOne({
      where: { produk_id: id },
    }).then(async (val) => {
      if (val) {
        price = val.price;
      }
    });
  } else if (server_id == 3) {
    await Digiflazz_product.findOne({
      where: { produk_id: id },
    }).then(async (val) => {
      if (val) {
        price = val.selectedSellerPrice;
      }
    });
  }
  return price;
};

module.exports = helper;
