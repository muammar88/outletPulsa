function request_deposit_index(path, url) {
  var tb = tables({
    width: [8, 22, 20, 10, 20, 10, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Member Info", center: true },
      { title: "Info Deposit", center: true },
      { title: "Status", center: true },
      { title: "Info Pengiriman", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "KODE TRANSAKSI, NAMA MEMBER, NOMOR WHATSAPP",
      width: 450,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Request Deposit Tidak Ditemukan",
  });

  return tb;
}

function request_deposit_start(path, url) {
  request_deposit(100, path, url);
}

function request_deposit(perpage, path, url, input) {
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
      '<td colspan="7"><center>Daftar Request Deposit Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_request_deposit(JSONData) {
  var json = JSON.parse(JSONData);
  var btn = [];
  if (json.status == "proses") {
    btn[0] = btnSuccess({
      title: "Setujui Request",
      onClick: ` onclick="setujui_request_deposit('${json.id}')" `,
      icon: "fas fa-check-double",
    });
    btn[1] = btnDanger({
      title: "Tolak Request",
      onClick: ` onclick="tolak_request_deposit('${json.id}')" `,
      icon: "fas fa-trash",
    });
  }
  btn[2] = btnDanger({
    title: "Delete Operator",
    onClick: ` onclick="delete_request_deposit('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_member = [
    { title: "NAMA", value: "<b>#" + json.nama_member + "</b>" },
    { title: "NOMOR WHATSAPP", value: json.nomor_whatsapp },
    {
      title: "STATUS MEMBER",
      value:
        json.status_member == "verified"
          ? `<b style="color:green;">TERVERIFIKASI</b>`
          : `<b style="color:red;">BELUM TERVERIFIKASI</b>`,
    },
  ];

  var obj_info_nominal_deposit = [
    { title: "NOMINAL", value: "Rp " + numberFormat(json.nominal) },
    {
      title: "KODE NOMINAL",
      value: "Rp " + numberFormat(json.nominal_tambahan),
    },
    {
      title: "TOTAL NOMINAL",
      value: "Rp " + numberFormat(json.nominal + json.nominal_tambahan),
    },
    { title: "BIAYA ADMIN", value: "Rp " + numberFormat(json.biaya_admin) },
  ];

  if (json.status == "gagal") {
    obj_info_nominal_deposit.push({
      title: "ALASAN PENOLAKAN",
      value: json.alasan_penolakan,
    });
  }

  var obj_info_pengiriman = [
    {
      title: "STATUS KIRIM",
      value: json.status_kirim == "belum_kirim" ? "BELUM KIRIM" : "SUDAH KIRIM",
    },
    { title: "WAKTU KIRIM", value: json.waktu_kirim == null ? "-" : "" },
  ];

  var info_member = simpleTableFunc(obj_info_member, "50");
  var info_nominal_deposit = simpleTableFunc(obj_info_nominal_deposit, "50");
  var info_pengiriman = simpleTableFunc(obj_info_pengiriman, "50");

  var status = "";
  if (json.status == "proses") {
    status = `<b style="color:orange;">PROSES</b>`;
  } else if (json.status == "sukses") {
    status = `<b style="color:green;">SUKSES</b>`;
  } else if (json.status == "gagal") {
    status = `<b style="color:red;">GAGAL</b>`;
  }

  var html = tr([
    td_center(["<b>#" + json.kode + "</b>"]),
    td_center([info_member]),
    td_center([info_nominal_deposit]),
    td_center([status]),
    td_center([info_pengiriman]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_request_deposit(id) {
  $.confirm({
    columnClass: "col-5",
    title: "Peringatan",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin akan menghapus <b>REQUEST DEPOSIT</b> ini?",
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      iya: {
        text: "IYA",
        btnClass: "btn-danger",
        action: function () {
          ajax_default(
            {
              url: Urls("Request_deposit/delete"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              request_deposit(100, "request_deposit", "Request_deposit");
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

function tolak_request_deposit(id) {
  my_modal({
    col: "5",
    title: "Tolak Request Deposit",
    form_func: "form_tolak_request_deposit",
    btn_label: "Tolak Request",
    btn_class: "btn-danger",
    data: { id: id },
    callback: function () {
      ajax_default(
        {
          url: Urls("Request_deposit/tolak"),
          method: "post",
          form: true,
        },
        function (e, xhr) {
          smile_alert(e.error_msg);
          request_deposit(100, "request_deposit", "Request_deposit");
        },
        function (status, errMsg) {
          frown_alert(errMsg.error_msg);
        }
      );
    },
  });
}

function form_tolak_request_deposit(i) {
  var id = `<input type="hidden" name="id" value="${i.data.id}">`;
  var form = myForm([
    col_12(id),
    col_12(
      textarea({
        label: "Alasan Penolakan Request Deposit",
        id_name: "alasan",
        value: "",
        placeholder: "Alasan Penolakan Request Deposit",
      })
    ),
  ]);

  return form;
}

function setujui_request_deposit(id) {
  $.confirm({
    columnClass: "col-5",
    title: "Peringatan",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin akan menyetujui <b>REQUEST DEPOSIT</b> ini?",
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      iya: {
        text: "IYA",
        btnClass: "btn-success",
        action: function () {
          ajax_default(
            {
              url: Urls("Request_deposit/setuju"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              request_deposit(100, "request_deposit", "Request_deposit");
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
