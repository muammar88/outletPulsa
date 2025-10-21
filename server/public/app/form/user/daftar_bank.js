function daftar_bank_index(path, url) {
  var tb = tables({
    width: [10, 20, 40, 20, 10],
    columns: [
      { title: "Image", center: true },
      { title: "Kode Bank", center: true },
      { title: "Nama Bank", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Bank Baru",
        title: "Tambah Bank Baru",
        icon: "fas fa-piggy-bank",
        onclick: "add_new_bank",
      }) +
      search_btn({
        placeholder: "KODE BANK",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Bank Tidak Ditemukan",
  });

  return tb;
}

function daftar_bank_start(path, url) {
  daftar_bank(100, path, url);
}

function daftar_bank(perpage, path, url, input) {
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
      '<td colspan="7"><center>Daftar Bank Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_bank(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDefault({
    title: "Edit Bank",
    onClick: ` onclick="edit_bank('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[1] = btnDanger({
    title: "Delete Bank",
    onClick: ` onclick="delete_bank('${json.id}')" `,
    icon: "fas fa-times",
  });

  var html = tr([
    td_center([`<img class="img-fluid" src="static/img/bank/${json.image}" >`]),
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function add_new_bank() {
  my_modal({
    col: "5",
    title: "Tambahkan Bank Baru",
    form_func: "form_add_update_bank",
    btn_label: "Tambahkan Bank Baru",
    callback: function () {
      var valid = new my_validation();
      valid
        .body("kode")
        .empty()
        .withMessage("Kode Bank Tidak Boleh Kosong!!!.");
      valid.body("name").empty().withMessage("Nama Bank Tidak Boleh Kosong!!!");
      if (valid.respose()) {
        frown_alert(valid.message());
        return false;
      } else {
        ajax_file(
          {
            url: Urls("Daftar_bank/add"),
            method: "post",
            form: true,
          },
          function (e, xhr) {
            smile_alert(e.error_msg);
            daftar_bank(100, "daftar_bank", "Daftar_bank");
          },
          function (status, errMsg) {
            frown_alert(errMsg.error_msg);
          }
        );
      }
    },
  });
}

function edit_bank(id) {
  ajax_default(
    {
      url: Urls("Daftar_bank/info_edit"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Update Data Bank ",
        form_func: "form_add_update_bank",
        btn_label: "Perbaharui Data Bank",
        value: e.value,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("kode")
            .empty()
            .withMessage("Kode Bank Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Bank Tidak Boleh Kosong!!!");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_file(
              {
                url: Urls("Daftar_bank/update"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                daftar_bank(100, "daftar_bank", "Daftar_bank");
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

function delete_bank(id) {
  ajax_default(
    {
      url: Urls("Daftar_bank/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_bank(100, "daftar_bank", "Daftar_bank");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_add_update_bank(i) {
  var id = "";
  var kode = "";
  var name = "";
  if (i.value != undefined) {
    id = `<input type="hidden" id="id" name="id"  value="${i.value.id}">`;
    kode = i.value.kode;
    name = i.value.name;
  }

  var form = myForm([
    col_12(id),
    col_12(
      input_text({
        label: "Kode Bank",
        id_name: "kode",
        value: kode,
        placeholder: "Kode Bank",
      })
    ),
    col_12(
      input_text({
        label: "Nama Bank",
        id_name: "name",
        value: name,
        placeholder: "Nama Bank",
      })
    ),
    col_12(
      input_file({
        label: "Upload Image",
        id_name: "photo",
        placeholder: "Upload Image Bank",
        note: "Dimensi maksimal 100x100 pixel.",
      })
    ),
  ]);

  return form;
}
