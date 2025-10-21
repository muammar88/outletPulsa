function otp_pendaftaran_index(path, url) {
  var tb = tables({
    width: [30, 25, 15, 25, 5],
    columns: [
      { title: "Info Member", center: true },
      { title: "Nomor Tujuan", center: true },
      { title: "Otp", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "Nomor Tujuan",
      width: 250,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Otp Pendaftaran Tidak Ditemukan",
  });

  return tb;
}

function otp_pendaftaran_start(path, url) {
  otp_pendaftaran(100, path, url);
}

function otp_pendaftaran(perpage, path, url, input) {
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
      '<td colspan="4"><center>Daftar Otp Pendaftaran Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_otp_pendaftaran(JSONData) {
  var json = JSON.parse(JSONData);

  var obj_info_member = [
    { title: "KODE", value: "<b>#" + json.kode + "</b>" },
    { title: "FULLNAME", value: json.fullname },
    { title: "NOMOR WHATSAPP", value: json.whatsapp_number.toString() },
    { title: "SALDO", value: "Rp " + numberFormat(json.saldo.toString()) },
  ];

  var info_member = simpleTableFunc(obj_info_member, "50");

  var btn = [];
  btn[0] = btnDanger({
    title: "Delete Otp Pendaftaran",
    onClick: ` onclick="delete_otp_register('${json.id}')" `,
    icon: "fas fa-times",
  });

  var html = tr([
    td_center([info_member]),
    td_center([json.nomor_tujuan]),
    td_center([json.otp]),
    td_center([json.updatedAt]),
    td_center(btn),
  ]);
  return html;
}

function delete_otp_register(id) {
  ajax_default(
    {
      url: Urls("Otp_pendaftaran/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      otp_pendaftaran(100, "otp_pendaftaran", "Otp_pendaftaran");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}
