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
 * Fungsi untuk melakukan delete request deposit
 *
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
        error_msg: "Proses Menghapus Request Deposit Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menghapus Request Deposit Gagal Dilakukan.",
      });
    }
  }
};

controllers.tolak = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // tolak_request_deposit process
    await model_cud.tolak();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Tolak Request Deposit Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Tolak Request Deposit Gagal Dilakukan.",
      });
    }
  }
};

controllers.setuju = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return ERROR
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_cud = new Model_cud(req);
    // tolak_request_deposit process
    await model_cud.setuju();
    // if (insert) {
    //   console.log("----------------AAA");
    //   await model_cud.update_setuju();
    // }
    // await model_cud.setuju();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Menyetujui Request Deposit Berhasil Dilakukan",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Menyetujui Request Deposit Gagal Dilakukan.",
      });
    }
  }
};

//

// /**
//  * Fungsi untuk Mengambil Parameter List Produk Prabayar
//  **/
// controllers.get_param_produk_prabayar = async (req, res) => {
//   const model_r = new Model_r(req);
//   const info = await model_r.get_param_produk_prabayar();
//   // error checking
//   if (info.error) {
//     res.status(400).json({
//       error: true,
//       error_msg: "Data Parameter Produk Prabayar Gagal Ditemukan",
//     });
//   } else {
//     res.status(200).json({
//       error: false,
//       error_msg: "Data Parameter Produk Prabayar Berhasil Ditemukan",
//       data: info.data,
//     });
//   }
// };

// /**
//  * Fungsi untuk Menghapus koneksi produk IAK dengan Produk
//  **/
// controllers.get_operator_produk = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_operator_produk();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Info operator produk Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Info operator produk Berhasil Ditemukan",
//         data: info.data,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil info sinkronisasi produk IAK
//  **/
// controllers.ubah_urutan = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // method untu mengubah urutan
//     await model_cud.ubah_urutan();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Mengubah Urutan Produk Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Mengubah Urutan Produk Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil info kostumer agen
//  **/
// controllers.get_info_add_produk = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_info_add_produk();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Add Produk Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Add Produk Berhasil Ditemukan",
//         data: info.data,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil data info operator berdasarkan kategori id
//  **/
// controllers.get_info_add_operator_by_kategori = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_info_add_operator_by_kategori();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Kategori Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Kategori Berhasil Ditemukan",
//         data: info.data,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk menambahkan data produk prabayar baru kedalam database
//  **/
// controllers.add_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // delete process
//     await model_cud.add_produk_prabayar();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Menambahkan Produk Baru Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Menambahkan Produk Baru Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil informasi koneksi dari data produk prabayar
//  **/
// controllers.get_daftar_server_terkoneksi = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_daftar_server_terkoneksi();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Server Yang Terkoneksi Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Server Yang Terkoneksi Berhasil Ditemukan",
//         data: { list: info.data, selected: info.selected },
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk memilih manual produk prabayar
//  **/
// controllers.pilih_server_manual = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // delete process
//     await model_cud.pilih_server_manual();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Pemilihan Server Manual Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses  Pemilihan Server Manual Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil info edit produk prabayar
//  **/
// controllers.get_info_edit_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_info_edit_produk_prabayar();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Edit Produk Prabayar Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Edit Produk Prabayar Berhasil Ditemukan",
//         data: info.data,
//         value: info.value,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk melakukan update produk prabayar
//  **/
// controllers.update_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // delete process
//     await model_cud.update_produk_prabayar();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Update Produk Prabayar Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Update Produk Prabayar Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengambil informasi markup produk prabayar sebelumnya
//  **/
// controllers.get_info_markup_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const info = await model_r.get_info_markup_produk_prabayar();
//     // error checking
//     if (info.error) {
//       res.status(400).json({
//         error: true,
//         error_msg: "Data Info Markup Produk Prabayar Gagal Ditemukan",
//       });
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg: "Data Info Markup Produk Prabayar Berhasil Ditemukan",
//         data: info.data,
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk mengupdate markup seluruh produk prabayar
//  **/
// controllers.update_markup_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_cud = new Model_cud(req);
//     // delete process
//     await model_cud.update_markup_produk_prabayar();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: "Proses Update Markup Produk Prabayar Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: "Proses Update Markup Produk Prabayar Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk memilih produk seller terbaik
//  **/
// controllers.pilih_produk_seller_terbaik = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const model_r = new Model_r(req);
//     const model_cud = new Model_cud(req);
//     const produk_prabayar = await model_r.get_produk_prabayar();
//     const produk_iak = await model_r.get_produk_iak();
//     const produk_tripay = await model_r.get_produk_tripay();
//     const produk_digiflaz = await model_r.get_produk_digiflaz();

//     for (let x in produk_prabayar) {
//       if (produk_iak[produk_prabayar[x].id] != undefined) {
//         if (Object.keys(produk_prabayar[x].produk_server).length > 0) {
//           produk_prabayar[x].produk_server = {
//             ...produk_prabayar[x].produk_server,
//             ...{ iak: produk_iak[produk_prabayar[x].id].price },
//           };
//         } else {
//           produk_prabayar[x].produk_server = {
//             iak: produk_iak[produk_prabayar[x].id].price,
//           };
//         }
//       }

//       if (produk_tripay[produk_prabayar[x].id] != undefined) {
//         if (Object.keys(produk_prabayar[x].produk_server).length > 0) {
//           produk_prabayar[x].produk_server = {
//             ...produk_prabayar[x].produk_server,
//             ...{ tripay: produk_tripay[produk_prabayar[x].id].price },
//           };
//         } else {
//           produk_prabayar[x].produk_server = {
//             tripay: produk_tripay[produk_prabayar[x].id].price,
//           };
//         }
//       }

//       if (produk_digiflaz[produk_prabayar[x].id] != undefined) {
//         if (Object.keys(produk_prabayar[x].produk_server).length > 0) {
//           produk_prabayar[x].produk_server = {
//             ...produk_prabayar[x].produk_server,
//             ...{ digiflaz: produk_digiflaz[produk_prabayar[x].id].price },
//           };
//         } else {
//           produk_prabayar[x].produk_server = {
//             digiflaz: produk_digiflaz[produk_prabayar[x].id].price,
//           };
//         }
//       }
//     }

//     for (let x in produk_prabayar) {
//       let arr = Object.values(produk_prabayar[x].produk_server);
//       let min = Math.min(...arr);

//       for (let y in produk_prabayar[x].produk_server) {
//         if (produk_prabayar[x].produk_server[y] == min) {
//           produk_prabayar[x].select_produk_server = { [y]: min };
//         }
//       }
//       delete produk_prabayar[x].produk_server;
//     }

//     // update data produk prabayar
//     await model_cud.pilih_produk_seller_terbaik(produk_prabayar);
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg:
//           "Proses Pemilihan Seller Terbaik Secara otomatis Berhasil Dilakukan",
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg:
//           "Proses Pemilihan Seller Terbaik Secara otomatis Gagal Dilakukan.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk melakukan markup seluruh produk prabayar
//  **/
// controllers.markup_produk_prabayar_all = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const body = req.body;
//     const model_r = new Model_r(req);
//     const model_cud = new Model_cud(req);
//     const nominal_1 =
//       body.nominal_1 == "" ? 0 : await hideCurrency(body.nominal_1);
//     const nominal_2 =
//       body.nominal_2 == "" ? 0 : await hideCurrency(body.nominal_2);
//     const nominal_3 =
//       body.nominal_3 == "" ? 0 : await hideCurrency(body.nominal_3);
//     const nominal_4 =
//       body.nominal_4 == "" ? 0 : await hideCurrency(body.nominal_4);
//     const nominal_5 =
//       body.nominal_5 == "" ? 0 : await hideCurrency(body.nominal_5);
//     const nominal_6 =
//       body.nominal_6 == "" ? 0 : await hideCurrency(body.nominal_6);

//     var update_produk = {};
//     var i = 0;
//     const produk_prabayar = await model_r.get_produk_prabayar_markup();

//     for (let x in produk_prabayar) {
//       var markup = produk_prabayar[x].markup;
//       var purchase = produk_prabayar[x].purchase_price;
//       if (purchase >= 1 && purchase <= 10000) {
//         if (markup != nominal_1) {
//           update_produk[i] = { id: x, markup: nominal_1 };
//           i++;
//         }
//       } else if (purchase >= 10001 && purchase <= 50000) {
//         if (markup != nominal_2) {
//           update_produk[i] = { id: x, markup: nominal_2 };
//           i++;
//         }
//       } else if (purchase >= 50001 && purchase <= 100000) {
//         if (markup != nominal_3) {
//           update_produk[i] = { id: x, markup: nominal_3 };
//           i++;
//         }
//       } else if (purchase >= 100001 && purchase <= 300000) {
//         if (markup != nominal_4) {
//           update_produk[i] = { id: x, markup: nominal_4 };
//           i++;
//         }
//       } else if (purchase >= 300001 && purchase <= 500000) {
//         if (markup != nominal_5) {
//           update_produk[i] = { id: x, markup: nominal_5 };
//           i++;
//         }
//       } else if (purchase >= 50000) {
//         if (markup != nominal_6) {
//           update_produk[i] = { id: x, markup: nominal_6 };
//           i++;
//         }
//       }
//     }
//     if (Object.keys(update_produk).length > 0) {
//       // update process
//       await model_cud.markup_produk_prabayar_all(update_produk);
//       // get response
//       if (await model_cud.response()) {
//         res.status(200).json({
//           error: false,
//           error_msg:
//             "Proses Update Markup Semua Produk Prabayar Berhasil Dilakukan",
//         });
//       } else {
//         res.status(400).json({
//           error: true,
//           error_msg:
//             "Proses Update Markup Semua Produk Prabayar Gagal Dilakukan.",
//         });
//       }
//     } else {
//       res.status(200).json({
//         error: false,
//         error_msg:
//           "Proses Update Markup Tidak Dilanjutkan, Karena Tidak Tedapat Perbedaan Antar Markup Sekarang dengan Markup Sebelumnya.",
//       });
//     }
//   }
// };

// /**
//  * Fungsi untuk menyimpan parameter download ke dalam sesi
//  **/
// controllers.download_produk_prabayar = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // return ERROR
//     const err_msg = await error_msg(errors);
//     res.status(400).json({ error: true, error_msg: err_msg });
//   } else {
//     const body = req.body;
//     const token = req.query.token;
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     if (typeof req.session.download_excel !== "undefined") {
//       req.session.download_excel = {
//         ...req.session.download_excel,
//         ...{
//           [decoded.kode]: {
//             kategori: body.kategori,
//             operator: body.operator,
//             server: body.server,
//             koneksi: body.koneksi,
//             search: body.search,
//           },
//         },
//       };
//     } else {
//       req.session.download_excel = {
//         [decoded.kode]: {
//           kategori: body.kategori,
//           operator: body.operator,
//           server: body.server,
//           koneksi: body.koneksi,
//           search: body.search,
//         },
//       };
//     }
//     res.status(200).json({
//       error: false,
//       error_msg: "Sesi Download Excel Berhasil Disimpan.",
//     });
//   }
// };

// /**
//  * Fungsi untuk melakukan proses download ke excel
//  **/
// controllers.download_excel = async (req, res) => {
//   const model_r = new Model_r(req);
//   const info_user = await model_r.info_user();
//   const info_produk = await model_r.info_produk_prabayar();

//   var workbook = new Excel.Workbook();

//   workbook.creator = info_user.name;
//   workbook.lastModifiedBy = info_user.name;
//   workbook.created = new Date();
//   workbook.modified = new Date();
//   workbook.lastPrinted = new Date();
//   workbook.properties.date1904 = true;

//   workbook.views = [
//     {
//       x: 0,
//       y: 0,
//       width: 10000,
//       height: 20000,
//       firstSheet: 0,
//       activeTab: 1,
//       visibility: "visible",
//     },
//   ];
//   var worksheet = workbook.addWorksheet("Download Produk Prabayar");
//   worksheet.columns = [
//     { header: "NOMOR URUT", key: "nomor_urut", width: 15 },
//     { header: "KODE PRODUK", key: "kode", width: 40 },
//     { header: "KODE OPERATOR", key: "kode_operator", width: 15 },
//     { header: "OPERATOR", key: "operator", width: 20 },
//     { header: "KATEGORI", key: "kategori", width: 20 },
//     { header: "NAMA PRODUK", key: "name", width: 40 },
//     { header: "HARGA", key: "harga", width: 20 },
//     { header: "MARKUP", key: "markup", width: 20 },
//   ];

//   worksheet.getColumn(1).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };
//   worksheet.getColumn(2).alignment = {
//     wrapText: true,
//   };
//   worksheet.getColumn(3).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };
//   worksheet.getColumn(4).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };
//   worksheet.getColumn(5).alignment = {
//     wrapText: true,
//   };
//   worksheet.getColumn(6).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };
//   worksheet.getColumn(7).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };
//   worksheet.getColumn(8).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };

//   worksheet.getRow(1).alignment = {
//     vertical: "middle",
//     horizontal: "center",
//   };

//   worksheet.getCell("A1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("B1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("C1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("D1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("E1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("F1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("G1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };
//   worksheet.getCell("H1").fill = {
//     type: "pattern",
//     pattern: "darkVertical",
//     bgColor: { argb: "1E364EFF" },
//   };

//   worksheet.getCell("A1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("B1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("C1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("D1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("E1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("F1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("G1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };
//   worksheet.getCell("H1").font = {
//     name: "Arial",
//     color: { argb: "FFFFFF" },
//     family: 2,
//     size: 11,
//   };

//   for (let x in info_produk) {
//     worksheet.addRow({
//       nomor_urut: info_produk[x].urutan,
//       kode: info_produk[x].kode,
//       kode_operator: info_produk[x].kode_operator,
//       operator: info_produk[x].operator,
//       kategori: info_produk[x].kategori,
//       name: info_produk[x].name,
//       harga: info_produk[x].harga_server,
//       markup: info_produk[x].markup,
//     });
//   }

//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=" + "Produk_prabayar.xlsx"
//   );

//   workbook.xlsx.write(res).then(function (data) {
//     res.end();
//   });
// };

module.exports = controllers;
