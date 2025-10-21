function riwayat_validasi_seller_index(path, url) {
  var tb = tables({
    width: [25, 25, 20, 25, 5],
    columns: [
      { title: "Nama Seller", center: true },
      { title: "Status Seller", center: true },
      { title: "Waktu Validasi", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "NAMA SELLER",
      width: 450,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Riwayat Validasi Seller Tidak Ditemukan",
  });

  return tb;
}

function riwayat_validasi_seller_start(path, url) {
  riwayat_validasi_seller(100, path, url);
}

function riwayat_validasi_seller(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  if (input != undefined) {
    param["pageNumber"] = input;
  }
  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="7"><center>Daftar Bank Transfer Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_riwayat_validasi_seller(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[1] = btnDanger({
    title: "Delete Riwayat Validasi Seller",
    onClick: ` onclick="delete_riwayat_validasi('${json.id}')" `,
    icon: "fas fa-times",
  });

  var html = tr([
    td_center([json.seller_name]),
    td_center([
      json.status_seller == "banned"
        ? `<b style="color:red;">Seller Di Blokir</b>`
        : `<b style="color:green;">Seller Tidak Di Blokir</b>`,
    ]),
    td_center([json.waktu_validasi]),
    td_center([json.updatedAt]),
    td_center(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_riwayat_validasi(id) {
  ajax_default(
    {
      url: Urls("Riwayat_validasi_seller/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      riwayat_validasi_seller(
        100,
        "riwayat_validasi_seller",
        "Riwayat_validasi_seller"
      );
      daftar_seller(100, "daftar_seller", "Daftar_seller");
      tes_produk(100, "tes_produk", "Tes_produk");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}
