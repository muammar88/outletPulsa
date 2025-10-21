function operator_index(path, url) {
  var tb = tables({
    width: [20, 25, 25, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Nama Operator", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Operator Baru",
        title: "Tambah Operator Baru",
        icon: "fas fa-boxes",
        onclick: "add_new_operator",
      }) +
      search_btn({
        placeholder: "Nama Operator",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Operator Tidak Ditemukan",
  });

  return tb;
}

function operator_start(path, url) {
  operator(100, path, url);
}

function operator(perpage, path, url, input) {
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
      '<td colspan="4"><center>Daftar Operator Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_operator(JSONData) {
  var json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDefault({
    title: "Edit Operator",
    onClick: ` onclick="edit_operator('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[1] = btnDanger({
    title: "Delete Operator",
    onClick: ` onclick="delete_operator('${json.id}')" `,
    icon: "fas fa-times",
  });
  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function add_new_operator() {
  my_modal({
    col: "5",
    title: "Tambah Operator Produk Baru",
    form_func: "form_add_update_operator",
    btn_label: "Tambah Operator Baru",
    callback: function () {
      var valid = new my_validation();
      valid
        .body("kode")
        .empty()
        .withMessage("Kode Operator Tidak Boleh Kosong!!!.");
      valid
        .body("name")
        .empty()
        .withMessage("Nama Operator Tidak Boleh Kosong!!!");
      if (valid.respose()) {
        frown_alert(valid.message());
        return false;
      } else {
        ajax_default(
          {
            url: Urls("Operator/tambah_operator"),
            method: "post",
            form: true,
          },
          function (e, xhr) {
            smile_alert(e.error_msg);
            operator_start("operator", "Operator");
          },
          function (status, errMsg) {
            frown_alert(errMsg.error_msg);
          }
        );
      }
    },
  });
}

function edit_operator(id) {
  ajax_default(
    {
      url: Urls("Operator/info_edit"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Edit Operator",
        form_func: "form_add_update_operator",
        btn_label: "Perbaharui Operators",
        value: e.data,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("kode")
            .empty()
            .withMessage("Kode Operator Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Operator Tidak Boleh Kosong!!!");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Operator/update"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                operator_start("operator", "Operator");
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
      frown_alert(errMsg.msg);
    }
  );
}

function delete_operator(id) {
  ajax_default(
    {
      url: Urls("Operator/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      operator_start("operator", "Operator");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function form_add_update_operator(i) {
  var id = "";
  var kode = "";
  var name = "";
  if (i.value != undefined) {
    id = `<input type="hidden" name="id" value="${i.value.id}">`;
    kode = i.value.kode;
    name = i.value.name;
  }
  return myForm([
    col_12(id),
    col_12(
      input_text({
        label: "Kode Operator Produk",
        id_name: "kode",
        value: kode,
        placeholder: "Kode Operator",
      })
    ),
    col_12(
      input_text({
        label: "Nama Operator Produk",
        id_name: "name",
        value: name,
        placeholder: "Nama Operator",
      })
    ),
  ]);
}
