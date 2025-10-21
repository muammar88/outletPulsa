function kategori_index(path, url) {
  var tb = tables({
    width: [20, 25, 25, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Nama Kategori", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Kategori Baru",
        title: "Tambah Kategori Baru",
        icon: "fas fa-boxes",
        onclick: "add_new_kategori",
      }) +
      search_btn({
        placeholder: "Nama Kategori",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Kategori Tidak Ditemukan",
  });

  return tb;
}

function kategori_start(path, url) {
  kategori(100, path, url);
}

function kategori(perpage, path, url, input) {
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
      '<td colspan="4"><center>Daftar Kategori Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_kategori(JSONData) {
  var json = JSON.parse(JSONData);

  var btn = [];

  btn[0] = btnDefault({
    title: "Edit Kategori",
    onClick: ` onclick="edit_kategori('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[1] = btnDanger({
    title: "Delete Kategori",
    onClick: ` onclick="delete_kategori('${json.id}')" `,
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

function add_new_kategori() {
  $.confirm({
    columnClass: "col-5",
    title: "Tambah Kategori Produk Baru",
    type: "blue",
    theme: "material",
    content: form_add_update_kategori(),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Tambah Kategori Baru",
        btnClass: "btn-primary",
        action: function () {
          const kode = $("#kode").val();
          const name = $("#name").val();

          var error = false;
          var message = "";
          if (kode == "") {
            error = true;
            message += "<li>Kode Kategori Tidak Boleh Kosong!!!.</li>";
          }
          if (name == 0) {
            error = true;
            message += "<li>Nama Kategori Tidak Boleh Kosong!!!</li>";
          }
          if (error == true) {
            frown_alert(`<ul class="pl-3">${message}</ul>`);
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Kategori/tambah_kategori"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                kategori_start("kategori", "Kategori");
              },
              function (status, errMsg) {
                frown_alert(errMsg.error_msg);
              }
            );
          }
        },
      },
    },
  });
}

function form_add_update_kategori(JSONValue) {
  var id = "";
  var kode = "";
  var name = "";
  if (JSONValue != undefined) {
    const value = JSON.parse(JSONValue);
    id = `<input type="hidden" name="id" value="${value.id}">`;
    kode = value.kode;
    name = value.name;
  }
  const form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                    <div class="col-12">
                      ${id}
                      <div class="form-group">
                        <label>Kode Kategori Produk</label>
                        <input type="text" name="kode" id="kode" class="form-control" value="${kode}" placeholder="Kode Kategori">
                      </div>
                      <div class="form-group">
                        <label>Nama Kategori Produk</label>
                        <input type="text" name="name" id="name" class="form-control" value="${name}" placeholder="Nama Kategori">
                      </div>
                    </div>
                  </div>
                </form>`;
  return form;
}

function delete_kategori(id) {
  ajax_default(
    {
      url: Urls("Kategori/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      kategori_start("kategori", "Kategori");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function edit_kategori(id) {
  ajax_default(
    {
      url: Urls("Kategori/info_edit"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Edit Kategori",
        type: "blue",
        theme: "material",
        content: form_add_update_kategori(JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Perbaharui Kategori",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Kategori/update"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  kategori_start("kategori", "Kategori");
                },
                function (status, errMsg) {
                  frown_alert(errMsg.error_msg);
                }
              );
            },
          },
        },
      });
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}
