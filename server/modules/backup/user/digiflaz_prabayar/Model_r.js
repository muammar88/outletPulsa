const moment = require("moment");
const {
  Op,
  Digiflazz_category,
  Digiflazz_brand,
  Digiflazz_type,
  Digiflazz_product,
  Digiflazz_seller_product,
  Digiflazz_seller,
  Produk_prabayar,
  Digiflazz_sellers,
  // Digiflazz_category,
  // Digiflazz_brand,
  // Digiflazz_type,
  // Digiflazz_product,
  Operator,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/digiflaz_prabayar/index");

const Digiflaz = require("../../../library/digiflaz");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  // get data in server side
  async server_side() {
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined) page = body.pageNumber;

    var where = { status: body.active == "active" ? "active" : "inactive" };
    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        ...{
          [Op.or]: [
            {
              selectedSellerBuyerSkuKode: {
                [Op.like]: "%" + body.search + "%",
              },
            },
            { name: { [Op.like]: "%" + body.search + "%" } },
          ],
        },
      };
    }

    if (body.kategori != 0) {
      where = { ...where, ...{ category_id: body.kategori } };
    }

    if (body.type != 0) {
      where = { ...where, ...{ type_id: body.type } };
    }

    if (body.brand != 0) {
      where = { ...where, ...{ brand_id: body.brand } };
    }

    if (body.koneksi != "semua") {
      if (body.koneksi == "sudah_konek") {
        where = { ...where, ...{ produk_id: { [Op.ne]: null } } };
      } else {
        where = { ...where, ...{ produk_id: null } };
      }
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      "status",
      "name",
      "selectedSellerBuyerSkuKode",
      "selectedSellerPrice",
      "selectedSellerStartCutOff",
      "selectedSellerEndCutOff",
      "produk_id",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Digiflazz_category,
        attributes: ["name"],
      },
      {
        required: true,
        model: Digiflazz_brand,
        attributes: ["name"],
      },
      {
        required: true,
        model: Digiflazz_type,
        attributes: ["name"],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Digiflazz_product.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_produk_id = [];
    var list_produk_digiflaz_id = [];
    var seller_selected = [];
    if (total > 0) {
      await Digiflazz_product.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              name: e.name,
              kategori: e.Digiflazz_category.name,
              brand: e.Digiflazz_brand.name,
              type: e.Digiflazz_type.name,
              kode: e.selectedSellerBuyerSkuKode,
              price: e.selectedSellerPrice,
              status: e.status,
              koneksi: {},
              seller: {},
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };

            list_produk_digiflaz_id[i] = e.id;

            seller_selected[i] = e.selectedSellerBuyerSkuKode;

            if (e.produk_id != null) {
              list_produk_id[e.produk_id] = i;
            }
            i++;
          })
        );
      });

      // convert array to object
      const tempListProdukId = Object.assign({}, list_produk_id);

      if (Object.keys(tempListProdukId).length > 0) {
        let ids = Object.keys(tempListProdukId);
        await Produk_prabayar.findAll({
          attributes: ["id", "kode", "name"],
          where: { id: { [Op.in]: ids } },
          include: {
            required: true,
            model: Operator,
            attributes: ["name"],
          },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list[list_produk_id[e.id]].koneksi = {
                kode: e.kode,
                name: e.name,
                operator:
                  e.Operator != null
                    ? e.Operator.name
                    : "<b style='color :red'>Operator NULL</b>",
              };
            })
          );
        });
      }

      if (list_produk_digiflaz_id.length > 0) {
        var list_seller = {};
        await Digiflazz_seller_product.findAll({
          attributes: [
            "product_digiflazz_id",
            "id",
            "buyerSkuKode",
            "price",
            "sellerProductStatus",
          ],
          where: { product_digiflazz_id: { [Op.in]: list_produk_digiflaz_id } },
          include: {
            required: true,
            model: Digiflazz_seller,
            where: { status: "unbanned" },
            attributes: ["name"],
          },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              if (list_seller[e.product_digiflazz_id] == undefined) {
                list_seller[e.product_digiflazz_id] = [
                  {
                    seller_id: e.id,
                    seller_name: e.Digiflazz_seller.name,
                    seller_code: e.buyerSkuKode,
                    seller_price: e.price,
                    seller_product_status: e.sellerProductStatus,
                    seller_selected: seller_selected.includes(e.buyerSkuKode)
                      ? "selected"
                      : "",
                  },
                ];
              } else {
                list_seller[e.product_digiflazz_id].push({
                  seller_id: e.id,
                  seller_name: e.Digiflazz_seller.name,
                  seller_code: e.buyerSkuKode,
                  seller_price: e.price,
                  seller_product_status: e.sellerProductStatus,
                  seller_selected: seller_selected.includes(e.buyerSkuKode)
                    ? "selected"
                    : "",
                });
              }
            })
          );
        });

        if (Object.keys(list_seller).length > 0) {
          for (x in list_produk_digiflaz_id) {
            if (list_seller[list_produk_digiflaz_id[x]] != undefined) {
              // list_seller[list_produk_digiflaz_id[x]].seller_selected = ;

              list[x].seller = list_seller[list_produk_digiflaz_id[x]];
            }
          }
        }
      }
    }

    return {
      data: list,
      total: total,
    };
  }

  async get_param_digiflaz() {
    var list_category = [];
    await Digiflazz_category.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list_category[i] = {
            id: e.id,
            name: e.name,
          };
          i++;
        })
      );
    });

    var list_brand = [];
    await Digiflazz_brand.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list_brand[i] = {
            id: e.id,
            name: e.name,
          };
          i++;
        })
      );
    });

    var list_type = [];
    await Digiflazz_type.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list_type[i] = {
            id: e.id,
            name: e.name,
          };
          i++;
        })
      );
    });
    return {
      error: false,
      data: { category: list_category, brand: list_brand, type: list_type },
    };
  }

  async info_sinkronisasi_produk_iak() {
    try {
      var list_produk_id = [];
      await Iak_prabayar_produk.findAll({
        where: { produk_id: { [Op.ne]: null } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_produk_id[i] = e.produk_id;
            i++;
          })
        );
      });

      var where = {};
      if (list_produk_id.length > 0) {
        where = { id: { [Op.notIn]: list_produk_id } };
      }

      var list = [];
      await Produk_prabayar.findAll({
        where: where,
        include: {
          required: true,
          model: Operator,
          attributes: ["name"],
        },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              operator: e.Operator.name,
            };
            i++;
          })
        );
      });

      return { error: false, data: list };
    } catch (error) {
      return { error: true };
    }
  }

  async get_info_pilih_seller_manual() {
    const body = this.req.body;
    var data = {};

    try {
      var selected_code = "";
      await Digiflazz_product.findOne({
        where: { id: body.id },
      }).then(async (val) => {
        if (val) {
          selected_code = val.selectedSellerBuyerSkuKode;
        }
      });

      var list = [];
      await Digiflazz_seller_product.findAll({
        where: {
          buyerSkuKode: { [Op.ne]: selected_code },
          product_digiflazz_id: body.id,
        },
        include: {
          required: true,
          model: Digiflazz_seller,
          where: {
            status: "unbanned",
          },
        },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              seller_id: e.seller_id,
              name: e.Digiflazz_seller.name,
              price: e.price,
              kode: e.buyerSkuKode,
            };
            i++;
          })
        );
      });

      return { error: false, data: list };
    } catch (error) {
      return { error: true };
    }
  }

  async info_sinkronisasi_produk_digiflaz() {
    try {
      var list_produk_id = [];
      await Digiflazz_product.findAll({
        where: { produk_id: { [Op.ne]: null } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_produk_id[i] = e.produk_id;
            i++;
          })
        );
      });

      var where = {};
      if (list_produk_id.length > 0) {
        where = { id: { [Op.notIn]: list_produk_id } };
      }
      // sql["order"] = [["id", "DESC"]];
      var list = [];
      await Produk_prabayar.findAll({
        where: where,
        order: [["operator_id", "DESC"]],
        include: {
          required: true,
          model: Operator,
          attributes: ["name"],
        },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              operator: e.Operator.name,
            };
            i++;
          })
        );
      });

      return { error: false, data: list };
    } catch (error) {
      return { error: true };
    }
  }

  async update_produk_digiflazz_prabayar() {
    const digiflaz = new Digiflaz();
    // category
    var category = [];
    await Digiflazz_category.findAll({
      attributes: ["id", "name"],
    }).then(async (value) => {
      await Promise.all(
        value.map(async (e) => {
          category[e.name.trim().replace(/\s/g, "_")] = e.id;
        })
      );
    });
    // brand
    var brand = [];
    await Digiflazz_brand.findAll({ attributes: ["id", "name"] }).then(
      async (value) => {
        await Promise.all(
          value.map(async (e) => {
            brand[e.name.trim().replace(/\s/g, "_")] = e.id;
          })
        );
      }
    );
    // type
    var type = [];
    await Digiflazz_type.findAll({ attributes: ["id", "name"] }).then(
      async (value) => {
        var i = 0;
        await Promise.all(
          value.map(async (e) => {
            type[e.name.trim().replace(/\s/g, "_")] = e.id;
            i++;
          })
        );
      }
    );
    // product
    var product = [];
    await Digiflazz_product.findAll({
      attributes: ["id", "name"],
      include: [
        {
          required: true,
          model: Digiflazz_category,
          attributes: ["name"],
        },
        {
          required: true,
          model: Digiflazz_brand,
          attributes: ["name"],
        },
        {
          required: true,
          model: Digiflazz_type,
          attributes: ["name"],
        },
      ],
    }).then(async (value) => {
      await Promise.all(
        value.map(async (e) => {
          var name = e.name.trim().replace(/\s/g, "_");
          var category = e.Digiflazz_category.name.trim().replace(/\s/g, "_");
          var brand = e.Digiflazz_brand.name.trim().replace(/\s/g, "_");
          var type = e.Digiflazz_type.name.trim().replace(/\s/g, "_");
          product[name + "+" + category + "+" + brand + "+" + type] = e.id;
        })
      );
    });
    // seller
    var seller = [];
    await Digiflazz_seller.findAll({ attributes: ["id", "name"] }).then(
      async (value) => {
        var i = 0;
        await Promise.all(
          value.map(async (e) => {
            seller[e.name.trim().replace(/\s/g, "_")] = e.id;
          })
        );
      }
    );
    // product seller
    var product_seller = [];
    await Digiflazz_seller_product.findAll({
      attributes: ["id", "product_digiflazz_id", "seller_id", "buyerSkuKode"],
      include: [
        {
          required: true,
          model: Digiflazz_product,
          attributes: ["name"],
        },
        {
          required: true,
          model: Digiflazz_seller,
          attributes: ["name"],
        },
      ],
    }).then(async (value) => {
      var i = 0;
      await Promise.all(
        value.map(async (e) => {
          if (product_seller[e.buyerSkuKode] == undefined) {
            product_seller[e.buyerSkuKode] = e.id;
          }
        })
      );
    });

    var newCategory = [];
    var newBrand = [];
    var newType = [];
    var newSeller = [];
    var newProduct = [];
    var newProductSeller = [];
    var updateProductSeller = [];

    try {
      await digiflaz.get_produk(async (re) => {
        console.log("_________________________________");
        console.log(re.data);
        console.log("_________________________________");

        var a = 1;
        await Promise.all(
          re.data.map(async (e) => {
            var e_category = e.category.trim().replace(/\s/g, "_");
            var e_brand = e.brand.trim().replace(/\s/g, "_");
            var e_type = e.type.trim().replace(/\s/g, "_");
            var e_seller = e.seller_name.trim().replace(/\s/g, "_");
            var e_product = e.product_name.trim().replace(/\s/g, "_");
            var e_key_product =
              e_product + "+" + e_category + "+" + e_brand + "+" + e_type;
            var e_buyer_sku_code = e.buyer_sku_code.trim();
            var e_status = e.buyer_product_status == true ? 1 : 0; //  e.status;
            var e_start_cut_off = e.start_cut_off;
            var e_end_cut_off = e.end_cut_off;
            var e_price = e.price;

            if (newProductSeller[e_buyer_sku_code] == undefined) {
              if (Object.keys(product_seller).length > 0) {
                if (product_seller[e_buyer_sku_code] == undefined) {
                  newProductSeller[e_buyer_sku_code] = {
                    key_product_id: e_key_product,
                    seller_name: e_seller,
                    buyer_sku_code: e_buyer_sku_code,
                    status: e_status,
                    price: e_price,
                    start_cut_off: e_start_cut_off,
                    end_cut_off: e_end_cut_off,
                  };
                } else {
                  updateProductSeller[e_buyer_sku_code] = {
                    buyerSkuKode: e_buyer_sku_code,
                    seller_name: e_seller,
                    price: e_price,
                    sellerProductStatus: e_status,
                    startCutOff: e_start_cut_off,
                    endCutOff: e_end_cut_off,
                  };
                }
              } else {
                newProductSeller[e_buyer_sku_code] = {
                  buyer_sku_code: e_buyer_sku_code,
                  status: e_status,
                  start_cut_off: e_start_cut_off,
                  end_cut_off: e_end_cut_off,
                };
              }
            }
            if (newProduct[e_key_product] == undefined) {
              if (Object.keys(product).length > 0) {
                if (product[e_key_product] == undefined) {
                  newProduct[e_key_product] = e_key_product;
                }
              } else {
                console.log("_____DDD4");
                newProduct[e_key_product] = e_key_product;
              }
            }
            if (newCategory[e_category] == undefined) {
              if (Object.keys(category).length > 0) {
                if (category[e_category] == undefined) {
                  newCategory[e_category] = e_category;
                }
              } else {
                newCategory[e_category] = e_category;
              }
            }
            if (newBrand[e_brand] == undefined) {
              if (Object.keys(brand).length > 0) {
                if (brand[e_brand] == undefined) {
                  newBrand[e_brand] = e_brand;
                }
              } else {
                newBrand[e_brand] = e_brand;
              }
            }
            if (newType[e_type] == undefined) {
              if (Object.keys(type).length > 0) {
                if (type[e_type] == undefined) {
                  newType[e_type] = e_type;
                }
              } else {
                newType[e_type] = e_type;
              }
            }
            if (newSeller[e_seller] == undefined) {
              if (Object.keys(seller).length > 0) {
                if (seller[e_seller] == undefined) {
                  newSeller[e_seller] = e_seller;
                }
              } else {
                newSeller[e_seller] = e_seller;
              }
            }
          })
        );

        console.log("----------------------AAAA<br>");
        console.log("+++++++++++++++++++newCategory");
        console.log(newCategory);
        console.log("+++++++++++++++++++newBrand");
        console.log(newBrand);
        console.log("+++++++++++++++++++newType");
        console.log(newType);
        console.log("+++++++++++++++++++newSeller");
        console.log(newSeller);
        // console.log("+++++++++++++++++++insertProduct");
        // console.log(insertProduct);
        console.log("----------------------AAAA<br>");
        console.log("----------------------AAAA<br>");
        console.log("++++++++product");
        console.log(product);
        console.log("++++++++product");

        // Menggunakan Promise.all() untuk menggabungkan dua Promise
        var categories = await this.insert_category(newCategory, category);
        var brands = await this.insert_brand(newBrand, brand);
        var typies = await this.insert_type(newType, type);
        var sellers = await this.insert_seller(newSeller, seller);
        var products = await this.insert_product({
          new_product: newProduct,
          product: product,
          categories,
          brands,
          typies,
          sellers,
        });

        if (Object.keys(newProductSeller).length > 0) {
          await this.insert_product_seller(newProductSeller, products, sellers);
        }

        if (Object.keys(updateProductSeller).length > 0) {
          await this.update_product_seller(updateProductSeller, sellers);
        }

        //callback();
      });
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  }

  async insert_category(newCategory, category) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (Object.keys(newCategory).length > 0) {
          var j = Object.keys(category).length;
          for (x in newCategory) {
            var insert = await Digiflazz_category.create({
              name: x.replace("_", " "),
              createdAt: myDate,
              updatedAt: myDate,
            });
            category[x] = insert.id;
          }
        }
        resolve(category);
      }, 1000);
    });
  }

  async insert_brand(newBrand, brand) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (Object.keys(newBrand).length > 0) {
          var j = Object.keys(brand).length;
          for (x in newBrand) {
            var insert = await Digiflazz_brand.create({
              name: x.replace("_", " "),
              createdAt: myDate,
              updatedAt: myDate,
            });
            brand[x] = insert.id;
          }
        }
        resolve(brand);
      }, 1000);
    });
  }

  async insert_type(newType, type) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (Object.keys(newType).length > 0) {
          var j = Object.keys(type).length;
          for (x in newType) {
            var insert = await Digiflazz_type.create({
              name: x.replace("_", " "),
              createdAt: myDate,
              updatedAt: myDate,
            });
            type[x] = insert.id;
          }
        }
        resolve(type);
      }, 1000);
    });
  }

  async insert_seller(newSeller, seller) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (Object.keys(newSeller).length > 0) {
          var j = Object.keys(seller).length;
          for (x in newSeller) {
            var insert = await Digiflazz_seller.create({
              name: x.replace("_", " "),
              status: "unbanned",
              createdAt: myDate,
              updatedAt: myDate,
            });
            seller[x] = insert.id;
          }
        }
        resolve(seller);
      }, 1000);
    });
  }

  async update_product_seller(param, seller) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        for (x in param) {
          await Digiflazz_seller_product.update(
            {
              seller_id: seller[param[x].seller_name],
              price: param[x].price,
              sellerProductStatus: param[x].sellerProductStatus,
              startCutOff: param[x].startCutOff,
              endCutOff: param[x].endCutOff,
              updatedAt: myDate,
            },
            {
              where: { buyerSkuKode: param[x].buyerSkuKode },
            }
          );
        }
      }, 1000);
    });
  }

  async insert_product_seller(param, product, seller) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    return new Promise((resolve) => {
      setTimeout(async () => {
        for (x in param) {
          var params = {
            product_digiflazz_id: product[param[x]["key_product_id"]],
            seller_id: seller[param[x].seller_name],
            buyerSkuKode: param[x].buyer_sku_code,
            price: param[x].price,
            sellerProductStatus: param[x].status,
            startCutOff: param[x].start_cut_off,
            endCutOff: param[x].end_cut_off,
            createdAt: myDate,
            updatedAt: myDate,
          };
          await Digiflazz_seller_product.create(params);
        }
      }, 1000);
    });
  }

  async insert_product(param) {
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    console.log("+++++++++++++++param");
    console.log(param["product"]);
    console.log("+++++++++++++++param");
    const product = param["product"];
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (Object.keys(param.new_product).length > 0) {
          // var j = Object.keys(product).length;
          for (x in param.new_product) {
            var myArray = x.split("+");

            var arr_product_name = myArray[0];
            var arr_category = myArray[1];
            var arr_brand = myArray[2];
            var arr_types = myArray[3];

            // console.log("________x");
            // console.log(myArray);
            // console.log(param.categories);
            // console.log(param.brands);
            // console.log(param.typies);
            // console.log(product);
            // console.log("________x");

            var categoryId = param.categories[arr_category];
            var brandId = param.brands[arr_brand];
            var typeId = param.typies[arr_types];

            var insert = await Digiflazz_product.create({
              name: arr_product_name.replace(/_/g, " "),
              category_id: categoryId,
              brand_id: brandId,
              type_id: typeId,
              status: "inactive",
              createdAt: myDate,
              updatedAt: myDate,
            });
            product[x] = insert.id;
          }
        }
        resolve(product);
      }, 1000);
    });
  }
}

module.exports = Model_r;
