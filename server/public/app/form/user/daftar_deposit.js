function daftar_deposit_index(path, url) {
  var tb = tables({
    width: [10, 20, 25, 25, 10, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Info Member", center: true },
      { title: "Nominal", center: true },
      { title: "Info Request", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "KODE TRANSAKSI DEPOSIT",
      width: 450,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Deposit Tidak Ditemukan",
  });

  return tb;
}

function daftar_deposit_start(path, url) {
  daftar_deposit(100, path, url);
}

function daftar_deposit(perpage, path, url, input) {
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
      '<td colspan="6"><center>Daftar Deposit Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_deposit(JSONData) {
  const json = JSON.parse(JSONData);

  var btn = [];
  btn[0] = btnDanger({
    title: "Delete Daftar Deposit ",
    onClick: ` onclick="delete_daftar_deposit('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_member = [
    {
      title: "NAMA MEMBER",
      value: json.nama_member,
    },
    { title: "NOMOR WHATSAPP", value: json.nomor_whatsapp },
  ];

  var obj_info_nominal = [
    {
      title: "NOMINAL",
      value: "Rp " + numberFormat(json.nominal),
    },
  ];

  if (json.nominal_tambahan != undefined) {
    obj_info_nominal.push({
      title: "NOMINAL TAMBAHAN",
      value: "Rp " + numberFormat(json.nominal_tambahan),
    });
    obj_info_nominal.push({
      title: "SALDO BEFORE",
      value: "Rp " + numberFormat(json.saldo_before),
    });
    obj_info_nominal.push({
      title: "SALDO AFTER",
      value: "Rp " + numberFormat(json.saldo_after),
    });
  }

  var obj_info_request = [
    {
      title: "KODE REQUEST",
      value: json.kode_request,
    },
    {
      title: "NOMINAL REQUEST",
      value: json.nominal_request,
    },
  ];

  var info_request = "Request Tidak Ditemukan";
  if (json.kode_request != undefined) {
    info_request = simpleTableFunc(obj_info_request, "50");
  }
  var info_nominal = simpleTableFunc(obj_info_nominal, "50");
  var info_member = simpleTableFunc(obj_info_member, "50");

  var html = tr([
    td_center(["<b>#" + json.kode + "</b>"]),
    td_center([info_member]),
    td_center([info_nominal]),
    td_center([info_request]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_daftar_deposit(id) {
  ajax_default(
    {
      url: Urls("Daftar_deposit/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_deposit(100, "daftar_deposit", "Daftar_deposit");
      request_deposit(100, "request_deposit", "Request_deposit");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}
