function produk_pascabayar_index(path, url) {
  var tb = tables({
    width: [25, 25, 25, 15, 10],
    columns: [
      { title: "Info Produk", center: true },
      { title: "Info Komisi", center: true },
      { title: "Info Status", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "",
        title: "Tambah Produk Pascabayar",
        icon: "fas fa-plus",
        onclick: "add_produk_pascabayar",
        class: "mr-2",
      }) +
      btn_success({
        label: "",
        title: "Markup Laba Produk Pascabayar",
        icon: "fas fa-money-bill",
        onclick: "markup_all_pascabayar",
        class: "mr-2",
      }) +
      btn_primary({
        label: "",
        title: "Update Harga Produk Pascabayar",
        icon: "fas fa-money-bill",
        onclick: "update_harga_produk_pascabayar",
        class: "mr-2",
      }) +
      search_btn({
        placeholder: "KODE PRODUK PASCABAYAR",
        width: 250,
        onclick: `onClick="produk_pascabayar(100, '${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "param_active_produk_pascabayar",
        option: [
          { id: "active", value: "Aktif" },
          { id: "inactive", value: "Non Aktif" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_server_produk_pascabayar",
        option: [{ id: "0", value: "Pilih Semua Server Produk" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_kategori_produk_pascabayar",
        option: [{ id: "0", value: "Pilih Semua Kategori Produk" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }),
    path: path,
    not_found_label: "Daftar Produk Pascabayar Tidak Ditemukan",
  });

  return tb;
}

function produk_pascabayar_start(path, url) {
  ajax_default(
    {
      url: Urls("Produk_pascabayar/get_param_produk_pascabayar"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      var option_kategori = `<option value="0">Pilih Semua Kategori</option>`;
      for (let x in e.data.kategori) {
        option_kategori += `<option value="${e.data.kategori[x].id}" >${e.data.kategori[x].name}</option>`;
      }
      $("#param_kategori_produk_pascabayar").html(option_kategori);

      var option_server = `<option value="0">Pilih Semua Kategori</option>`;
      for (let x in e.data.server) {
        option_server += `<option value="${e.data.server[x].id}" >${e.data.server[x].name}</option>`;
      }
      $("#param_server_produk_pascabayar").html(option_server);

      produk_pascabayar(100, path, url);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function produk_pascabayar(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  param["kategori"] = $("#param_kategori_produk_pascabayar").val();
  param["server"] = $("#param_server_produk_pascabayar").val();
  param["active"] = $("#param_active_produk_pascabayar").val();

  if (input != undefined) {
    param["pageNumber"] = input;
  }

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Produk Pascabayar Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_produk_pascabayar(JSONData) {
  var json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDefault({
    title: "Update Markup Produk Pascabayar",
    onClick: ` onclick="update_markup_produk_pascabayar('${json.id}')" `,
    icon: "fas fa-money-bill-alt",
  });
  btn[1] = btnDefault({
    title: "Edit Produk Pascabayar",
    onClick: ` onclick="edit_produk_pascabayar('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[2] = btnDanger({
    title: "Delete Produk Pascabayar",
    onClick: ` onclick="delete_produk_pascabayar('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_product = [
    { title: "KODE", value: "<b>#" + json.kode + "</b>" },
    { title: "NAME", value: json.name },
    { title: "KATEGORI", value: json.kategori },
  ];

  var obj_info_komisi = [
    {
      title: "FEE",
      value: "Rp " + numberFormat(json.fee == null ? 0 : json.fee),
    },
    {
      title: "KOMISI",
      value: "Rp " + numberFormat(json.comission == null ? 0 : json.comission),
    },
    {
      title: "MARKUP",
      value: "Rp " + numberFormat(json.outletFee == null ? 0 : json.outletFee),
    },
  ];

  var obj_info_status = [
    {
      title: "STATUS",
      value:
        json.status == "inactive"
          ? `<b style="color:red;">INACTIVE</b>`
          : `<b style="color:green;">ACTIVE</b>`,
    },
    {
      title: "KODE SERVER",
      value:
        json.kode_server == "" || json.kode_server == null
          ? "-"
          : json.kode_server,
    },
    {
      title: "NAMA SERVER",
      value:
        json.nama_server == "" || json.nama_server == null
          ? "-"
          : json.nama_server,
    },
  ];

  var info_product = simpleTableFunc(obj_info_product, "30");
  var info_komisi = simpleTableFunc(obj_info_komisi, "50");
  var info_status = simpleTableFunc(obj_info_status, "50");

  var html = tr([
    td_center([info_product]),
    td_center([info_komisi]),
    td_center([info_status]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function form_add_update_data_produk_pascabayar(i) {
  var id = "";
  var kode = "";
  var name = "";
  var selected = "";

  if (i.value != undefined) {
    id = `<input type="hidden" value="${i.value.id}" name="id">`;
    kode = i.value.kode;
    name = i.value.name;
    selected = i.value.kategori_id;
  }

  var option = option_gen({
    default: "Pilih Kategori",
    data: i.data.list_kategori,
    selected: selected,
  });

  var form = myForm([
    col_12(id),
    col_12(
      select({
        label: "Daftar Kategori",
        id_name: "kategori",
        placeholder: "Daftar Kategori",
        option: option,
      })
    ),
    col_12(
      input_text({
        label: "Kode Produk Pascabayar",
        id_name: "kode",
        value: kode,
        placeholder: "Kode Produk Pascabayar",
      })
    ),
    col_12(
      input_text({
        label: "Nama Produk Pascabayar",
        id_name: "name",
        value: name,
        placeholder: "Nama Produk Pascabayar",
      })
    ),
  ]);
  return form;
}

function add_produk_pascabayar() {
  ajax_default(
    {
      url: Urls("Produk_pascabayar/get_info_add_produk_pascabayar"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Tambah Produk Pascabayar Baru",
        form_func: "form_add_update_data_produk_pascabayar",
        btn_label: "Tambah Produk Pascabayar Baru",
        data: e.data,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("kode")
            .empty()
            .withMessage("Kode Produk Pascabayar Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Produk Pascabayar Tidak Boleh Kosong!!!");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Produk_pascabayar/add"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                produk_pascabayar(
                  100,
                  "produk_pascabayar",
                  "Produk_pascabayar"
                );
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

function delete_produk_pascabayar(id) {
  $.confirm({
    columnClass: "col-5",
    title: "Konfirmasi Penghapusan Produk Pascabayar",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin akan menghapus produk pascabayar ini?",
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
              url: Urls("Produk_pascabayar/delete"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_pascabayar(100, "produk_pascabayar", "Produk_pascabayar");
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

function edit_produk_pascabayar(id) {
  ajax_default(
    {
      url: Urls("Produk_pascabayar/get_info_edit_produk_pascabayar"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Edit Data Produk Pascabayar",
        form_func: "form_add_update_data_produk_pascabayar",
        btn_label: "Perbaharui Data Produk Pascabayar",
        data: e.data,
        value: e.value,
        callback: function () {
          var valid = new my_validation();
          valid
            .body("kode")
            .empty()
            .withMessage("Kode Produk Pascabayar Tidak Boleh Kosong!!!.");
          valid
            .body("name")
            .empty()
            .withMessage("Nama Produk Pascabayar Tidak Boleh Kosong!!!");
          if (valid.respose()) {
            frown_alert(valid.message());
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Produk_pascabayar/update"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                produk_pascabayar(
                  100,
                  "produk_pascabayar",
                  "Produk_pascabayar"
                );
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

function update_markup_produk_pascabayar(id) {
  ajax_default(
    {
      url: Urls("Produk_pascabayar/get_info_markup_produk_pascabayar"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      my_modal({
        col: "5",
        title: "Update Markup Produk Pascabayar",
        form_func: "form_update_markup_produk_pascabayar",
        btn_label: "Perbaharui Data Markup Produk Pascabayar",
        // data: e.data,
        value: e.value,
        callback: function () {
          ajax_default(
            {
              url: Urls("Produk_pascabayar/update_markup"),
              method: "post",
              form: true,
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              produk_pascabayar(100, "produk_pascabayar", "Produk_pascabayar");
            },
            function (status, errMsg) {
              frown_alert(errMsg.error_msg);
            }
          );
        },
      });
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function form_update_markup_produk_pascabayar(i) {
  var id = "";
  var markup = "";

  if (i.value != undefined) {
    id = `<input type="hidden" value="${i.value.id}" name="id">`;
    markup = i.value.markup;
  }

  var form = myForm([
    col_12(id),
    col_12(
      input_curency({
        label: "Markup Produk Pascabayar",
        id_name: "markup",
        value: "Rp " + numberFormat(markup),
        placeholder: "Markup Produk Pascabayar",
      })
    ),
  ]);
  return form;
}

function markup_all_pascabayar() {
  my_modal({
    col: "5",
    title: "Update Markup Produk Pascabayar",
    form_func: "form_update_markup_all_produk_pascabayar",
    btn_label: "Perbaharui Data Markup Produk Pascabayar",
    callback: function () {
      ajax_default(
        {
          url: Urls("Produk_pascabayar/update_markup_all_produk"),
          method: "post",
          form: true,
        },
        function (e, xhr) {
          smile_alert(e.error_msg);
          produk_pascabayar(100, "produk_pascabayar", "Produk_pascabayar");
        },
        function (status, errMsg) {
          frown_alert(errMsg.error_msg);
        }
      );
    },
  });
}

function form_update_markup_all_produk_pascabayar() {
  var html = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                <div class="row px-0 mx-0">
                    <div class="col-12">
                        <div class="row">
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 1 - 1.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="1 - 1.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_1" class="form-control form-control-sm currency" placeholder="1 - 1.000"/>
                                </div>
                            </div>
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk 1.001 - 2.000</label>
                                <input type="text" class="form-control form-control-sm" disabled value="1.001 - 2.000"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_2" class="form-control form-control-sm currency" placeholder="1.001 - 2.000"/>
                                </div>
                            </div>
                           
                            <div class="col-7">
                                <div class="form-group">
                                <label>Range Harga Produk > 2.001</label>
                                <input type="text" class="form-control form-control-sm" disabled value="> 2.001"/>
                                </div>
                            </div>
                            <div class="col-5">
                                <div class="form-group">
                                <label>Nominal Markup</label>
                                <input type="text" name="nominal_3" class="form-control form-control-sm currency" placeholder="> 2.001"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </form>`;
  return html;
}

function update_harga_produk_pascabayar() {
  ajax_default(
    {
      url: Urls("Produk_pascabayar/update_harga_produk_pascabayar"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      produk_pascabayar(100, "produk_pascabayar", "Produk_pascabayar");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}
