function daftar_server_index(path, url) {
  var tb = tables({
    width: [10, 20, 10, 30, 20, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Nama Server", center: true },
      { title: "Status", center: true },
      { title: "Jumlah Produk", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Server Baru",
        title: "Tambah Server Baru",
        icon: "fas fa-server",
        onclick: "add_new_server",
      }) +
      search_btn({
        placeholder: "KODE / Nama Server",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Sever Tidak Ditemukan",
  });

  return tb;
}

function daftar_server_start(path, url) {
  daftar_member(100, path, url);
}

function daftar_server(perpage, path, url, input) {
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
      '<td colspan="6"><center>Daftar Sever Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_server(JSONData) {
  var json = JSON.parse(JSONData);

  var btn = [];

  btn[0] = btnPrimary({
    title: "Ganti Status Daftar Server",
    onClick: ` onclick="change_status_server('${json.id}')" `,
    icon: "fas fa-check-double",
  });
  btn[1] = btnDefault({
    title: "Edit Daftar Server",
    onClick: ` onclick="edit_daftar_server('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[2] = btnDanger({
    title: "Delete Daftar Server",
    onClick: ` onclick="delete_daftar_server('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_produk = [
    {
      title: "TOTAL PRODUK",
      value: json.total_produk.toString() + " Produk",
    },
    {
      title: "TOTAL PRODUK TERKONEKSI",
      value: json.total_produk_terkoneksi.toString() + " Produk",
    },
    {
      title: "TOTAL PRODUK BELUM TERKONEKSI",
      value: json.total_produk_belum_terkoneksi.toString() + " Produk",
    },
  ];

  var info_product = simpleTableFunc(obj_produk, "50");

  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([
      json.status == "active"
        ? `<b style="color:green;" >ACTIVE</b>`
        : `<b style="color:red;">NON ACTIVE</b>`,
    ]),
    td_center([info_product]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function add_new_server() {
  $.confirm({
    columnClass: "col-5",
    title: "Tambah Server Baru",
    type: "blue",
    theme: "material",
    content: form_add_update_server(),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Tambah Server Baru",
        btnClass: "btn-primary",
        action: function () {
          var kode = $("#kode").val();
          var name = $("#name").val();
          var error = false;
          var message = "";
          if (kode == "") {
            error = true;
            message += "<li>Kode Server tidak boleh kosong</li>";
          }
          if (name == "") {
            error = true;
            message += "<li>Nama Server tidak boleh kosong</li>";
          }
          if (error == true) {
            frown_alert(`<ul class="pl-3">${message}</ul>`);
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Daftar_server/add_new_server"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                daftar_server_start("daftar_server", "Daftar_server");
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

function form_add_update_server(JSONValue) {
  var id = "";
  var kode = "";
  var name = "";

  if (JSONValue != undefined) {
    var value = JSON.parse(JSONValue);
    id = `<input type="hidden" value="${value.id}" name="id" id="id">`;
    kode = value.kode;
    name = value.name;
  }

  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          ${id}
                          <div class="form-group">
                              <label>Kode</label>
                              <input type="text" class="form-control" name="kode" id="kode" placeholder="Kode Server" value="${kode}" >
                          </div>
                          <div class="form-group">
                              <label>Name</label>
                              <input type="text" class="form-control" name="name" id="name" placeholder="Nama Server" value="${name}">
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}

function delete_daftar_server(id) {
  ajax_default(
    {
      url: Urls("Daftar_server/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_server_start("daftar_server", "Daftar_server");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function edit_daftar_server(id) {
  ajax_default(
    {
      url: Urls("Daftar_server/info_edit_server"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Edit Data Server",
        type: "blue",
        theme: "material",
        content: form_add_update_server(JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Edit Data Server",
            btnClass: "btn-primary",
            action: function () {
              var id = $("#id").val();
              var kode = $("#kode").val();
              var name = $("#name").val();
              var error = false;
              var message = "";
              if (id == undefined || id == "") {
                error = true;
                message += "<li>ID Server tidak Ditemukan</li>";
              }
              if (kode == "") {
                error = true;
                message += "<li>Kode Server tidak boleh kosong</li>";
              }
              if (name == "") {
                error = true;
                message += "<li>Nama Server tidak boleh kosong</li>";
              }
              if (error == true) {
                frown_alert(`<ul class="pl-3">${message}</ul>`);
                return false;
              } else {
                ajax_default(
                  {
                    url: Urls("Daftar_server/update"),
                    method: "post",
                    form: true,
                  },
                  function (e, xhr) {
                    smile_alert(e.error_msg);
                    daftar_server_start("daftar_server", "Daftar_server");
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
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function change_status_server(id) {
  ajax_default(
    {
      url: Urls("Daftar_server/info_status_server"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Edit Status Server",
        type: "blue",
        theme: "material",
        content: form_add_update_status_server(id, e.data),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Edit Status Server",
            btnClass: "btn-primary",
            action: function () {
              var id = $("#id").val();
              var status = $("#status").val();
              var error = false;
              var message = "";
              if (id == undefined || id == "") {
                error = true;
                message += "<li>ID Server tidak Ditemukan</li>";
              }
              if (error == true) {
                frown_alert(`<ul class="pl-3">${message}</ul>`);
                return false;
              } else {
                ajax_default(
                  {
                    url: Urls("Daftar_server/change_status_server"),
                    method: "post",
                    form: true,
                  },
                  function (e, xhr) {
                    smile_alert(e.error_msg);
                    daftar_server_start("daftar_server", "Daftar_server");
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
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_add_update_status_server(id, JSONValue) {
  console.log(JSON);
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" id="id" value="${id}">
                          <div class="form-group">
                              <label>Status Server</label>
                              <select class="form-control" name="status" id="status">
                                 <option value="active" ${
                                   JSONValue == "active" ? "selected" : ""
                                 }>Aktif</option>
                                 <option value="inactive" ${
                                   JSONValue == "inactive" ? "selected" : ""
                                 }>Non Aktif</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}
