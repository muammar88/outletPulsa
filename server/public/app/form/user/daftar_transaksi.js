function daftar_transaksi_index(path, url) {
  var tb = tables({
    width: [10, 25, 25, 25, 10, 5],
    columns: [
      { title: "KODE", center: true },
      { title: "INFO PRODUK", center: true },
      { title: "INFO MEMBER", center: true },
      { title: "INFO TRANSAKSI", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      search_btn({
        placeholder: "KODE TRANSAKSI",
        width: 250,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "status_transaksi",
        option: [
          { id: "semua", value: "Semua Status" },
          { id: "sukses", value: "Sukses" },
          { id: "proses", value: "Proses" },
          { id: "gagal", value: "Gagal" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }),
    path: path,
    not_found_label: "Daftar Transaksi Tidak Ditemukan",
  });

  return tb;
}

function daftar_transaksi_start(path, url) {
  daftar_transaksi(100, path, url);
}

function daftar_transaksi(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  if (input != undefined) {
    param["pageNumber"] = input;
  }
  param["status_transaksi"] = $("#status_transaksi").val();

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Transaksi Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_transaksi(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];

  var obj_info_produk = [
    {
      title: "KODE PRODUK",
      value: "<b>#" + json.produk_info.kode + "</b>",
    },
    { title: "NAMA PRODUK", value: json.produk_info.name },
    {
      title: "TIPE PRODUK",
      value:
        json.produk_info.tipe == "pascabayar"
          ? `<b>PASCABAYAR</b>`
          : "<b>PRABAYAR</b>",
    },
  ];

  var obj_info_member = [
    {
      title: "KODE MEMBER",
      value: "<b>#" + json.member_info.kode + "</b>",
    },
    {
      title: "NAMA MEMBER",
      value: json.member_info.name,
    },
    {
      title: "NOMOR WHATSAPP",
      value: json.member_info.whatsapp_number,
    },
  ];
  var status = "";
  var obj_info_transaksi = [];
  if (Object.keys(json.transaction_prabayar).length > 0) {
    var proses = proses_transaksi_prabayar(json);

    obj_info_transaksi = proses.obj_info_transaksi;
    status = proses.status;
    btn = proses.btn;
  } else if (Object.keys(json.transaction_pascabayar).length > 0) {
    var proses = proses_transaksi_pascabayar(json);
    obj_info_transaksi = proses.obj_info_transaksi;
    status = proses.status;
    btn = proses.btn;
  }

  var info_produk = simpleTableFunc(obj_info_produk, "40");
  var info_member = simpleTableFunc(obj_info_member, "40");
  var info_transaksi = simpleTableFunc(obj_info_transaksi, "50");

  var html = tr([
    td_center([`<b>#` + json.kode + `</b>`]),
    td_center([info_produk]),
    td_center([info_member]),
    td_center([info_transaksi]),
    td_center([json.updatedAt]),
    td_center(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function proses_transaksi_prabayar(json) {
  var status = "";
  if (json.transaction_prabayar.status == "sukses") {
    status = `<span style="color:green;font-weight:bold;">SUKSES</span>`;
  } else if (json.transaction_prabayar.status == "gagal") {
    status = `<span style="color:green;font-weight:bold;">GAGAL</span>`;
  } else if (json.transaction_prabayar.status == "proses") {
    status = `<span style="color:orange;font-weight:bold;">PROSES</span>`;
  }
  var btn = [];
  btn[0] = btnPrimary({
    title: "Periksa Ulang Transaksi",
    onClick: ` onclick="recheck_transaction('${json.id}')" `,
    icon: "fas fa-check-double",
  });

  if (json.transaction_prabayar.status != "proses") {
    btn[1] = btnDanger({
      title: "Delete Transaksi",
      onClick: ` onclick="delete_transaksi('${json.id}')" `,
      icon: "fas fa-times",
    });
  }

  var obj_info_transaksi = [
    {
      title: "STATUS",
      value: status,
    },
    {
      title: "NOMOR TUJUAN",
      value: json.transaction_prabayar.nomor_tujuan,
    },
    {
      title: "HARGA PEMBELIAN",
      value: "Rp " + numberFormat(json.transaction_prabayar.purchase_price),
    },
    {
      title: "HARGA PENJUALAN",
      value: "Rp " + numberFormat(json.transaction_prabayar.selling_price),
    },
    {
      title: "FEE",
      value:
        "Rp " +
        numberFormat(
          json.transaction_prabayar.fee_agen == null
            ? 0
            : json.transaction_prabayar.fee_agen
        ),
    },
    {
      title: "LABA",
      value:
        "Rp " +
        numberFormat(
          json.transaction_prabayar.laba == null
            ? 0
            : json.transaction_prabayar.laba
        ),
    },

    {
      title: "SERVER",
      value:
        "(" +
        json.transaction_prabayar.kode_server +
        ") " +
        json.transaction_prabayar.name_server,
    },
    {
      title: "SALDO SEBELUMNYA",
      value: "Rp " + numberFormat(json.saldo_before),
    },
    {
      title: "SALDO SESUDAHNYA",
      value: "Rp " + numberFormat(json.saldo_after),
    },
  ];

  return { obj_info_transaksi, btn, status };
}

function proses_transaksi_pascabayar(json) {
  var status = "";
  if (json.transaction_pascabayar.status == "sukses") {
    status = `<span style="color:green;font-weight:bold;">SUKSES</span>`;
  } else if (json.transaction_pascabayar.status == "gagal") {
    status = `<span style="color:green;font-weight:bold;">GAGAL</span>`;
  } else if (json.transaction_pascabayar.status == "proses") {
    status = `<span style="color:orange;font-weight:bold;">PROSES</span>`;
  }
  var btn = [];
  btn[0] = btnPrimary({
    title: "Periksa Ulang Transaksi",
    onClick: ` onclick="recheck_transaction('${json.id}')" `,
    icon: "fas fa-check-double",
  });

  if (json.transaction_pascabayar.status != "proses") {
    btn[1] = btnDanger({
      title: "Delete Transaksi",
      onClick: ` onclick="delete_transaksi('${json.id}')" `,
      icon: "fas fa-times",
    });
  }

  var obj_info_transaksi = [
    {
      title: "STATUS",
      value: status,
    },
    {
      title: "NOMOR TUJUAN",
      value: json.transaction_pascabayar.nomor_tujuan,
    },
    {
      title: "NOMINAL",
      value: "Rp " + numberFormat(json.transaction_pascabayar.nominal),
    },
    {
      title: "TOTAL NOMINAL",
      value: "Rp " + numberFormat(json.transaction_pascabayar.total_nominal),
    },
    {
      title: "ADMIN FEE",
      value: "Rp " + numberFormat(json.transaction_pascabayar.admin_fee),
    },
    {
      title: "KOMISI",
      value: "Rp " + numberFormat(json.transaction_pascabayar.comission),
    },
    {
      title: "OUTLET KOMISI",
      value: "Rp " + numberFormat(json.transaction_pascabayar.outlet_comission),
    },
    {
      title: "MEMBER KOMISI",
      value: "Rp " + numberFormat(json.transaction_pascabayar.member_comission),
    },
    {
      title: "NOREF",
      value: json.transaction_pascabayar.noref,
    },
    {
      title: "SERVER",
      value:
        " (" +
        json.transaction_pascabayar.kode_server +
        ") " +
        json.transaction_pascabayar.name_server,
    },
  ];

  return { obj_info_transaksi, btn, status };
}

// {
//   "nomor_tujuan": "530000000001",
//   "nominal": 300000,
//   "total_nominal": 302750,
//   "admin_fee": 2750,
//   "comission": 1800,
//   "outlet_comission": 200,
//   "member_comission": 1600,
//   "noref": "1600",
//   "kode_agen": null,
//   "laba": 0,
//   "fee_agen": 0,
//   "status": "sukses",
//   "kode_server": "IAK",
//   "name_server": "IAK"
// }

function delete_transaksi(id) {
  $.confirm({
    columnClass: "col-4",
    title: "Peringatan",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin untuk <b>MENGHAPUS TRANSAKSI</b> ini?.",
    closeIcon: false,
    buttons: {
      tidak: function () {
        return true;
      },
      iya: {
        text: "Iya",
        btnClass: "btn-danger",
        action: function () {
          ajax_default(
            {
              url: Urls("Daftar_transaksi/delete"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              daftar_transaksi(100, "daftar_transaksi", "Daftar_transaksi");
            },
            function (status, errMsg) {
              frown_alert(errMsg.error_msg);
            }
          );
        },
      },
    },
  });
}
