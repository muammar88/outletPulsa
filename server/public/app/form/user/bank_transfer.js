function bank_transfer_index(path, url) {
  var tb = tables({
    width: [25, 20, 15, 15, 15, 10],
    columns: [
      { title: "Info Bank", center: true },
      { title: "Nama Akun Bank", center: true },
      { title: "Nomor Akun Bank", center: true },
      { title: "Biaya SMS Notifikasi", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Bank Transfer Baru",
        title: "Tambah Bank Transfer Baru",
        icon: "fas fa-piggy-bank",
        onclick: "add_new_bank_transfer",
      }) +
      search_btn({
        placeholder: "NAMA AKUN BANK",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Bank Transfer Tidak Ditemukan",
  });

  return tb;
}

function bank_transfer_start(path, url) {
  bank_transfer(100, path, url);
}

function bank_transfer(perpage, path, url, input) {
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

function List_bank_transfer(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDefault({
    title: "Edit Bank Transfer",
    onClick: ` onclick="edit_bank_transfer('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[1] = btnDanger({
    title: "Delete Bank Transfer",
    onClick: ` onclick="delete_bank_transfer('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_bank = [
    { title: "KODE BANK", value: "<b>#" + json.kode_bank + "</b>" },
    { title: "NAMA BANK", value: json.nama_bank },
  ];

  var info_bank = simpleTableFunc(obj_info_bank, "30");

  var html = tr([
    td_center([info_bank]),
    td_center([json.account_name]),
    td_center([json.account_number]),
    td_center(["Rp " + numberFormat(json.biaya_admin)]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function add_new_bank_transfer() {
  ajax_default(
    {
      url: Urls("Bank_transfer/info_add"),
      method: "get",
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Tambah Bank Transfer",
        form_func: "form_add_update_bank_transfer",
        btn_label: "Tambah Data Bank Transfer",
        data: e.data,
        // value: e.value,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("bank_transfer")
            .select_not_nol()
            .withMessage("Anda Wajib Memilih Salah Satu Bank.")
            .empty()
            .withMessage("Bank Transfer Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Akun Bank Tidak Boleh Kosong!!!.");
          valid
            .body("nomor")
            .empty()
            .withMessage("Nomor Akun Bank Tidak Boleh Kosong!!!.");
          valid
            .body("biaya_admin")
            .empty()
            .withMessage("Biaya Admin Tidak Boleh Kosong!!!.")
            .empty_currency()
            .withMessage("Biaya Admin idak Boleh Kosong!!!.");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Bank_transfer/add"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                bank_transfer(100, "bank_transfer", "Bank_transfer");
              },
              function (status, errMsg) {
                frown_alert(errMsg.error_msg);
              }
            );
          }
        },
      });
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function edit_bank_transfer(id) {
  ajax_default(
    {
      url: Urls("Bank_transfer/info_edit"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Update Bank Transfer",
        form_func: "form_add_update_bank_transfer",
        btn_label: "Perbaharui Data Bank Transfer",
        data: e.data,
        value: e.value,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("bank_transfer")
            .select_not_nol()
            .withMessage("Anda Wajib Memilih Salah Satu Bank.")
            .empty()
            .withMessage("Bank Transfer Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Akun Bank Tidak Boleh Kosong!!!.");
          valid
            .body("nomor")
            .empty()
            .withMessage("Nomor Akun Bank Tidak Boleh Kosong!!!.");
          valid
            .body("biaya_admin")
            .empty()
            .withMessage("Biaya Admin Tidak Boleh Kosong!!!.")
            .empty_currency()
            .withMessage("Biaya Admin idak Boleh Kosong!!!.");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Bank_transfer/update"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                bank_transfer(100, "bank_transfer", "Bank_transfer");
              },
              function (status, errMsg) {
                frown_alert(errMsg.error_msg);
              }
            );
          }
        },
      });
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function delete_bank_transfer(id) {
  ajax_default(
    {
      url: Urls("Bank_transfer/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      bank_transfer(100, "bank_transfer", "Bank_transfer");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_add_update_bank_transfer(i) {
  var id = "";
  var selected = "";
  var nama_akun = "";
  var nomor_akun = "";
  var biaya_admin = "";
  if (i.value != undefined) {
    id = `<input type="hidden" id="id" name="id"  value="${i.value.id}">`;
    selected = i.value.bank_id;
    nama_akun = i.value.account_name;
    nomor_akun = i.value.account_number;
    biaya_admin = "Rp " + numberFormat(i.value.biaya_admin);
  }

  var option = option_gen({
    default: "Pilih Bank",
    data: i.data.bank,
    selected: selected,
  });

  var form = myForm([
    col_12(id),
    col_12(
      select({
        label: "Daftar Bank",
        id_name: "bank_transfer",
        placeholder: "Daftar Bank Transfer",
        option: option,
      })
    ),
    col_12(
      input_text({
        label: "Nama Akun Bank",
        id_name: "name",
        value: nama_akun,
        placeholder: "Nama Akun Bank",
      })
    ),
    col_12(
      input_text({
        label: "Nomor Akun Bank",
        id_name: "nomor",
        value: nomor_akun,
        placeholder: "Nomor Akun Bank",
      })
    ),
    col_12(
      input_curency({
        label: "Biaya SMS Administrator",
        id_name: "biaya_admin",
        value: biaya_admin,
        placeholder: "Biaya SMS Administrator",
      })
    ),
  ]);

  return form;
}
