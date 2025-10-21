function produk_prabayar_index(path, url) {
  var tb = tables({
    width: [25, 25, 6, 27, 7, 10],
    columns: [
      { title: "Info Produk", center: true },
      { title: "Info Harga", center: true },
      { title: "Server", center: true },
      { title: "Koneksi Server", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "",
        title: "Pilih Produk Seller Terbaik",
        icon: "fas fa-server",
        onclick: "pilih_produk_seller_terbaik",
        class: "mr-2",
      }) +
      btn_primary({
        label: "",
        title: "Tambah Produk",
        icon: "fas fa-plus",
        onclick: "add_produk",
        class: "mr-2",
      }) +
      btn_success({
        label: "",
        title: "Markup Laba Produk",
        icon: "fas fa-money-bill",
        onclick: "markup",
        class: "mr-2",
      }) +
      btn_primary({
        label: "",
        title: "Update Harga",
        icon: "fas fa-money-bill",
        onclick: "update_harga",
        class: "mr-2",
      }) +
      btn_primary({
        label: "",
        title: "Download Excel",
        icon: "fas fa-file-excel",
        onclick: "download_to_excel_produk_prabayar",
        class: "mr-2",
      }) +
      btn_primary({
        label: "",
        title: "Upload Excel",
        icon: "fas fa-file-upload",
        onclick: "upload_excel_to_database",
        class: "mr-2",
      }) +
      search_btn({
        placeholder: "KODE PRODUK",
        width: 250,
        onclick: `onClick="produk_prabayar(100, '${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "param_koneksi_produk_prabayar",
        option: [
          { id: "semua", value: "Semua" },
          { id: "sudah_konek", value: "Sudah Konek" },
          { id: "belum_konek", value: "Belum Konek" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_active_produk_prabayar",
        option: [
          { id: "active", value: "Aktif" },
          { id: "inactive", value: "Non Aktif" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_server_produk_prabayar",
        option: [{ id: "0", value: "Pilih Semua Server Produk" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_operator_produk_prabayar",
        option: [{ id: "0", value: "Pilih Semua Operator Produk" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_kategori_produk_prabayar",
        option: [{ id: "0", value: "Pilih Semua Kategori Produk" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;" onClick="get_operator_produk()" `,
      }),
    path: path,
    not_found_label: "Daftar Produk Prabayar Tidak Ditemukan",
  });

  return tb;
}

function produk_prabayar_start(path, url) {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_param_produk_prabayar"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      var option_kategori = `<option value="0">Pilih Semua Kategori</option>`;
      for (let x in e.data.kategori) {
        option_kategori += `<option value="${e.data.kategori[x].id}" >${e.data.kategori[x].name}</option>`;
      }
      $("#param_kategori_produk_prabayar").html(option_kategori);

      var option_server = `<option value="0">Pilih Semua Kategori</option>`;
      for (let x in e.data.server) {
        option_server += `<option value="${e.data.server[x].id}" >${e.data.server[x].name}</option>`;
      }
      $("#param_server_produk_prabayar").html(option_server);

      produk_prabayar(100, path, url);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function produk_prabayar(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  param["kategori"] = $("#param_kategori_produk_prabayar").val();
  param["operator"] = $("#param_operator_produk_prabayar").val();
  param["server"] = $("#param_server_produk_prabayar").val();
  param["active"] = $("#param_active_produk_prabayar").val();
  param["koneksi"] = $("#param_koneksi_produk_prabayar").val();

  if (input != undefined) {
    param["pageNumber"] = input;
  }

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Produk Prabayar Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_produk_prabayar(JSONData) {
  var json = JSON.parse(JSONData);
  var btn = [];

  if (json.harga_server != null) {
    btn[0] = btnDefault({
      title: "Pilih Server Manual",
      onClick: ` onclick="pilih_server_manual('${json.id}')" `,
      icon: "fas fa-server",
    });
  }

  btn[1] = btnDefault({
    title: "Update Markup Produk Prabayar",
    onClick: ` onclick="update_markup_produk_prabayar('${json.id}')" `,
    icon: "fas fa-money-bill-alt",
  });
  btn[2] = btnDefault({
    title: "Edit Produk Prabayar",
    onClick: ` onclick="edit_produk_prabayar('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[3] = btnDanger({
    title: "Delete Produk Prabayar",
    onClick: ` onclick="delete_produk_prabayar('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_product = [
    { title: "KODE", value: "<b>#" + json.kode + "</b>" },
    { title: "NAME", value: json.name },
    { title: "KATEGORI", value: json.kategori },
    { title: "OPERATOR", value: json.operator },
    {
      title: "URUTAN",
      value: `<button type="button" class="btn btn-default ml-1 my-1" id="btn_${json.id}" title="Urutan" onclick="ubahUrutan(${json.id}, '${json.kode}', '${json.name}',   ${json.urutan})" >
                Urutan ${json.urutan}
              </button>`,
    },
  ];

  var obj_info_harga = [
    {
      title: "HARGA SERVER",
      value:
        json.harga_server != null
          ? "Rp " + numberFormat(json.harga_server)
          : "Harga Tidak Ditemukan",
    },
    {
      title: "MARKUP",
      value:
        json.markup != null
          ? "Rp " + numberFormat(json.markup)
          : "Harga Tidak Ditemukan",
    },
    {
      title: "HARGA JUAL",
      value: "Rp " + numberFormat(json.harga_server + json.markup),
    },
    {
      title: "STATUS",
      value:
        json.status == "active"
          ? `<span style="color:green">Active</span>`
          : `<span style="color:red">Inactive</span>`,
    },
  ];

  var obj_koneksi = [];
  if (json.koneksi.length > 0) {
    var i = 0;
    for (let x in json.koneksi) {
      obj_koneksi[i] = {
        title: json.koneksi[x].server,
        value:
          "<b>" +
          json.koneksi[x].kode +
          "</b><br>" +
          json.koneksi[x].name +
          "<br><b>Rp " +
          numberFormat(json.koneksi[x].price) +
          "</b><br>" +
          json.koneksi[x].status,
      };
      i++;
    }
  }

  var info_product = simpleTableFunc(obj_info_product, "30");
  var info_harga = simpleTableFunc(obj_info_harga, "40");
  var info_koneksi = "Koneksi Tidak Temukan";
  if (obj_koneksi.length > 0) {
    info_koneksi = simpleTableFunc(obj_koneksi, "30");
  }

  var html = tr([
    td_center([info_product]),
    td_center([info_harga]),
    td_center([json.server_name]),
    td_center([info_koneksi]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function get_operator_produk() {
  var id = $("#param_kategori_produk_prabayar").val();
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_operator_produk"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      var option = `<option value="0">Pilih Semua Operator Produk</option>`;
      for (let x in e.data) {
        option += `<option value="${e.data[x].id}" >${e.data[x].name} (${e.data[x].kode})</option>`;
      }
      $("#param_operator_produk_prabayar").html(option);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function ubahUrutan(id, kode, name, urutan) {
  $.confirm({
    columnClass: "col-5",
    title: "Ubah Urutan",
    type: "blue",
    theme: "material",
    content: form_ubah_urutan(id, kode, name, urutan),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Ubah Urutan",
        btnClass: "btn-primary",
        action: function () {
          ajax_default(
            {
              url: Urls("Produk_prabayar/ubah_urutan"),
              method: "post",
              form: true,
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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

function form_ubah_urutan(id, kode, name, urutan) {
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Kode</label>
                              <input type="text" class="form-control" value="${kode}" placeholder="Kode" disabled="">
                          </div>
                          <div class="form-group">
                              <label>Nama Produk</label>
                              <input type="text" class="form-control" value="${name}" placeholder="Nama Produk" disabled="" >
                          </div>
                          <div class="form-group">
                              <label>Urutan</label>
                              <input type="text" class="form-control" name="urutan" value="${urutan}" placeholder="Urutan" >
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}

function add_produk() {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_info_add_produk"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Tambah Produk baru",
        type: "blue",
        theme: "material",
        content: form_add_update_produk(JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Tambah Produk Baru",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Produk_prabayar/add_produk_prabayar"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_add_update_produk(JSONData, JSONValue) {
  var json = JSON.parse(JSONData);

  var id = "";
  var kategori_id = "";
  var operator_id = "";
  var kode = "";
  var name = "";

  var option_kategori = `<option value="0">Pilih Kategori</option>`;
  var option_operator = `<option value="0">Pilih Operator</option>`;

  if (JSONValue != undefined) {
    var value = JSON.parse(JSONValue);
    id = `<input type="hidden" name="id" value="${value.id}">`;
    kategori_id = value.kategori_id;
    operator_id = value.operator_id;
    kode = value.kode;
    name = value.name;
  }

  for (let x in json.list_kategori) {
    option_kategori += `<option value="${json.list_kategori[x].id}" 
    ${json.list_kategori[x].id == kategori_id ? "selected" : ""}>${
      json.list_kategori[x].name
    } (${json.list_kategori[x].kode})</option>`;
  }

  if (json.list_operator != undefined) {
    for (let x in json.list_operator) {
      option_operator += `<option value="${json.list_operator[x].id}" 
    ${json.list_operator[x].id == operator_id ? "selected" : ""}>${
        json.list_operator[x].name
      } (${json.list_operator[x].kode})</option>`;
    }
  }
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          ${id}
                          <div class="form-group">
                              <label>Kategori</label>
                              <select class="form-control js-example-tags" name="kategori" id="kategori" onChange="get_operator_add_produk()"> 
                                ${option_kategori}
                              </select>
                          </div>
                          <div class="form-group">
                              <label>Operator</label>
                              <select class="form-control js-example-tags" name="operator" id="operator"> 
                                ${option_operator}
                              </select>
                          </div>
                          <div class="form-group">
                              <label>Kode</label>
                              <input type="text" class="form-control" name="kode" value="${kode}" placeholder="Kode Produk">
                          </div>
                          <div class="form-group">
                              <label>Nama Produk</label>
                              <input type="text" class="form-control" name="name" value="${name}" placeholder="Nama Produk" >
                          </div>
                          
                      </div>
                  </div>
              </form>
              <script>
                $(".js-example-tags").select2({
                  tags: true
                });
              </script>`;
  return form;
}

function get_operator_add_produk() {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_info_add_operator_by_kategori"),
      method: "post",
      loader: true,
      data: { kategori_id: $("#kategori").val() },
    },
    function (e, xhr) {
      var option = `<option value="0">Pilih Operator</option>`;
      for (let x in e.data) {
        option += `<option value="${e.data[x].id}"> ${e.data[x].name} (${e.data[x].kode})</option>`;
      }
      $("#operator").html(option);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function delete_produk_prabayar(id) {
  $.confirm({
    columnClass: "col-5",
    title: "Konfirmasi Penghapusan Produk Prabayar",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin akan menghapus produk prabayar ini?",
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      ya: {
        text: "Iya",
        btnClass: "btn-danger",
        action: function () {
          ajax_default(
            {
              url: Urls("Produk_prabayar/delete_produk_prabayar"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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

function pilih_server_manual(id) {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_daftar_server_terkoneksi"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Konfirmasi Penghapusan Produk Prabayar",
        type: "blue",
        theme: "material",
        content: form_pilih_server_manual(
          id,
          JSON.stringify(e.data.list),
          e.data.selected
        ),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          ya: {
            text: "Pilih Server Manual",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Produk_prabayar/pilih_server_manual"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_pilih_server_manual(id, JSONData, JSONSelected) {
  var json = JSON.parse(JSONData);

  var option = "";
  for (x in json) {
    option += `<option value="${json[x].id}" 
    ${json[x].id == JSONSelected ? "selected" : ""}>
    ( SERVER : ${json[x].server_name} ) ( ${json[x].kode} :  ${
      json[x].name
    } ) HARGA : Rp ${numberFormat(json[x].price)}</option>`;
  }
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Pilih Server Manual</label>
                              <select class="form-control" name="server_id" id="server_id">
                                ${option}
                              </select>
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}

function edit_produk_prabayar(id) {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_info_edit_produk_prabayar"),
      method: "post",
      data: {
        id: id,
      },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Edit Produk",
        type: "blue",
        theme: "material",
        content: form_add_update_produk(
          JSON.stringify(e.data),
          JSON.stringify(e.value)
        ),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Perbaharui Data Produk",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Produk_prabayar/update_produk_prabayar"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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
      frown_alert(errMsg.error_msg);
    }
  );
}

function update_markup_produk_prabayar(id) {
  ajax_default(
    {
      url: Urls("Produk_prabayar/get_info_markup_produk_prabayar"),
      method: "post",
      data: {
        id: id,
      },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Update Markup Produk Prabayar",
        type: "blue",
        theme: "material",
        content: form_update_markup_produk(id, e.data.markup),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Perbaharui Data Markup Produk",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Produk_prabayar/update_markup_produk_prabayar"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_update_markup_produk(id, markUp) {
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" value="${id}" name="id">
                          <div class="form-group">
                              <label>Markup Produk</label>
                              <input type="text" class="form-control currrency" name="markup" value="Rp ${numberFormat(
                                markUp != null ? markUp : 0
                              )}" placeholder="Markup Produk" >
                          </div>
                      </div>
                  </div>
              </form>
               <script>
                  $(document).on( "keyup", ".currency", function(e){
                      var e = window.event || e;
                      var keyUnicode = e.charCode || e.keyCode;
                          if (e !== undefined) {
                              switch (keyUnicode) {
                                  case 16: break;
                                  case 27: this.value = ''; break;
                                  case 35: break;
                                  case 36: break;
                                  case 37: break;
                                  case 38: break;
                                  case 39: break;
                                  case 40: break;
                                  case 78: break;
                                  case 110: break;
                                  case 190: break;
                                  default: $(this).formatCurrency({ colorize: true, negativeFormat: '-%s%n', roundToDecimalPlace: -1, eventOnDecimalsEntered: true });
                              }
                          }
                  } );
               </script>`;
  return form;
}

function pilih_produk_seller_terbaik() {
  ajax_default(
    {
      url: Urls("Produk_prabayar/pilih_produk_seller_terbaik"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function markup() {
  $.confirm({
    columnClass: "col-7",
    title: "Markup Produk Prabayar",
    type: "blue",
    theme: "material",
    content: form_update_markup_all(),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Markup Produk Prabayar",
        btnClass: "btn-primary",
        action: function () {
          ajax_default(
            {
              url: Urls("Produk_prabayar/markup_produk_prabayar_all"),
              method: "post",
              loader: true,
              form: true,
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
            },
            function (status, errMsg) {
              frown_alert(errMsg);
            }
          );
        },
      },
    },
  });
}

function form_update_markup_all() {
  var html = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                <div class="row px-0 mx-0">
                    <div class="col-12">
                        <div class="row">
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 1 - 10.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="1 - 10.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_1" class="form-control form-control-sm currency" placeholder="1 - 10.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 10.001 - 50.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="10.001 - 50.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_2" class="form-control form-control-sm currency" placeholder="10.001 - 50.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 50.001 - 100.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="50.001 - 100.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_3" class="form-control form-control-sm currency" placeholder="50.001 - 100.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 100.001 - 300.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="100.001 - 300.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_4" class="form-control form-control-sm currency" placeholder="100.001 - 300.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 300.001 - 500.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="300.001 - 500.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_5" class="form-control form-control-sm currency" placeholder="300.001 - 500.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk > 500.001</label>
                                <input type="text" class="form-control form-control-sm" disabled value="> 500.001"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_6" class="form-control form-control-sm currency" placeholder="> 500.001"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </form>
                <script>
                    $(document).on( "keyup", ".currency", function(e){
                        var e = window.event || e;
                        var keyUnicode = e.charCode || e.keyCode;
                            if (e !== undefined) {
                                switch (keyUnicode) {
                                    case 16: break;
                                    case 27: this.value = ''; break;
                                    case 35: break;
                                    case 36: break;
                                    case 37: break;
                                    case 38: break;
                                    case 39: break;
                                    case 40: break;
                                    case 78: break;
                                    case 110: break;
                                    case 190: break;
                                    default: $(this).formatCurrency({ colorize: true, negativeFormat: '-%s%n', roundToDecimalPlace: -1, eventOnDecimalsEntered: true });
                                }
                            }
                    } );
                </script>`;
  return html;
}

function download_to_excel_produk_prabayar() {
  ajax_default(
    {
      url: Urls("Produk_prabayar/download_produk_prabayar"),
      method: "post",
      data: {
        kategori: $("#param_kategori_produk_prabayar").val(),
        operator: $("#param_operator_produk_prabayar").val(),
        server: $("#param_server_produk_prabayar").val(),
        active: $("#param_active_produk_prabayar").val(),
        koneksi: $("#param_koneksi_produk_prabayar").val(),
        search: $("#search_produk_prabayar").val(),
      },
      loader: true,
    },
    function (e, xhr) {
      window.open(Urls("Produk_prabayar/download_excel"), "_blank");
    },
    function (status, errMsg) {
      frown_alert(errMsg);
    }
  );
}

function upload_excel_to_database() {
  $.confirm({
    columnClass: "col-5",
    title: "Upload Excel To Database",
    type: "blue",
    theme: "material",
    content: form_upload_excel_to_database(),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Upload Data Excel",
        btnClass: "btn-primary",
        action: function () {
          ajax_file(
            {
              url: Urls("Produk_prabayar/upload_excel"),
              method: "post",
              form: true,
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_prabayar(100, "produk_prabayar", "Produk_prabayar");
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

function form_upload_excel_to_database() {
  var html = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                <div class="row px-0 mx-0">
                    <div class="col-12">
                        <div class="form-group">
                          <label>Upload excel to database</label>
                          <input type="file" class="form-control form-control-sm" name="excel"/>
                        </div>
                    </div>
                  </div>
                </form>`;
  return html;
}
