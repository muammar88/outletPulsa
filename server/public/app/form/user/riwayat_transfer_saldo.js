function riwayat_transfer_saldo_index(path, url) {
  var tb = tables({
    width: [10, 25, 30, 25, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Info Member", center: true },
      { title: "Info Transfer", center: true },
      { title: "Info Saldo", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "KODE MEMBER",
      width: 450,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Riwayat Transfer Saldo Member Tidak Ditemukan",
  });

  return tb;
}

function riwayat_transfer_saldo_start(path, url) {
  riwayat_transfer_saldo(100, path, url);
}

function riwayat_transfer_saldo(perpage, path, url, input) {
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
      '<td colspan="9"><center>Riwayat Transfer Saldo Member Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_riwayat_transfer_saldo(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDanger({
    title: "Delete Riwayat Transfer Saldo",
    onClick: ` onclick="delete_riwayat_transfer_saldo('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_member = [
    { title: "Kode Member", value: "<b>#" + json.kode_member + "</b>" },
    { title: "Nama Member", value: json.member_name },
    { title: "Nomor Whatsapp", value: json.whatsapp },
  ];

  var obj_info_saldo = [
    { title: "Saldo Sebelum", value: "Rp " + numberFormat(json.saldo_before) },
    { title: "Saldo Sesudah", value: "Rp " + numberFormat(json.saldo_after) },
  ];

  var obj_info_transfer = [
    { title: "Nominal", value: "Rp " + numberFormat(json.nominal) },
    {
      title: "Tipe",
      value:
        json.tipe == "transfer_saldo" ? `<b>TRANSFER</b>` : " <b>TERIMA</b>",
    },
    {
      title: json.tipe == "transfer_saldo" ? `Kode Penerima` : "Kode Pengirim",
      value: "<b>#" + json.invoice + "</b>",
    },
    {
      title: json.tipe == "transfer_saldo" ? "Nama Penerima" : "Nama Pengirim",
      value: json.nama_target,
    },
    {
      title:
        json.tipe == "transfer_saldo"
          ? "Whatsapp Penerima"
          : "Whatsapp Pengirim",
      value: json.whatsapp_target,
    },
  ];

  var info_member = simpleTableFunc(obj_info_member, "40");
  var info_saldo = simpleTableFunc(obj_info_saldo, "50");
  var info_transfer = simpleTableFunc(obj_info_transfer, "50");

  var html = tr([
    td_center([json.kode]),
    td_center([info_member]),
    td_center([info_transfer]),
    td_center([info_saldo]),
    td_center([json.updatedAt]),
    td_center(btn),
  ]);
  return html;
}

function delete_riwayat_transfer_saldo(id) {
  ajax_default(
    {
      url: Urls("Riwayat_transfer_saldo/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      riwayat_transfer_saldo_start(
        "riwayat_transfer_saldo",
        "Riwayat_transfer_saldo"
      );
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}
