const {
  Digiflazz_type,
  Digiflazz_category,
  Digiflazz_product,
  Digiflazz_seller_product,
  Produk_prabayar,
} = require("../../../db/models");

const helper = {};

helper.check_tipe_id = async (value) => {
  check = await Digiflazz_type.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Tipe Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_brand_id = async (value) => {
  check = await Digiflazz_brand.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Brand Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_kategori_id = async (value) => {
  check = await Digiflazz_category.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Category Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_id = async (value) => {
  check = await Digiflazz_product.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Produk Digiflaz Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_produk_id = async (id) => {
  var check = await Digiflazz_product.findOne({
    where: { produk_id: id },
  });
  if (!check) {
    var check_to = await Produk_prabayar.findOne({
      where: { id: id },
    });
    if (!check_to) {
      throw new Error("ID Produk Tidak Terdaftar Dipangkalan Data.");
    }
  } else {
    throw new Error(
      "ID Produk ini sudah terkoneksi dengan produk Digiflaz yang lain."
    );
  }
  return true;
};

helper.info_product_seller = async (value) => {
  var list = {};
  await Digiflazz_seller_product.findOne({
    where: { id: value },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["buyerSkuKode"] = val.buyerSkuKode;
      list["price"] = val.price;
      list["sellerProductStatus"] = val.sellerProductStatus;
      list["startCutOff"] = val.startCutOff;
      list["endCutOff"] = val.endCutOff;
    }
  });
  return list;
};

helper.info = async (value) => {
  var list = {};
  await Digiflazz_product.findOne({
    where: { id: value },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["name"] = val.name;
      list["kode"] = val.selectedSellerBuyerSkuKode;
    }
  });
  return list;
};

// helper.info_produk_outlet = async (value) => {

// }

helper.info_produk_outlet = async (id) => {
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

module.exports = helper;
