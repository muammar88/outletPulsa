function tripay_prabayar_index(path, url) {
  var tb = tables({
    width: [5, 20, 15, 10, 10, 15, 20, 5],
    columns: [
      { title: "Kode", center: true },
      { title: "Nama Produk", center: true },
      { title: "Operator / Type", center: true },
      { title: "Harga", center: true },
      { title: "Status", center: true },
      { title: "Koneksi", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Update Produk Tripay",
        title: "Update Produk Tripay",
        icon: "fas fa-recycle",
        onclick: "update_produk_prabayar_tripay",
      }) +
      search_btn({
        placeholder: "KODE PRODUK",
        width: 350,
        onclick: `onClick="tripay_prabayar(100, '${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "param_koneksi_tripay_prabayar",
        option: [
          { id: "semua", value: "Semua" },
          { id: "sudah_konek", value: "Sudah Konek" },
          { id: "belum_konek", value: "Belum Konek" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_active_tripay_prabayar",
        option: [
          { id: "active", value: "Aktif" },
          { id: "inactive", value: "Non Aktif" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_operator_tripay_prabayar",
        option: [{ id: "0", value: "Pilih Semua Operator" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;float:right;width: 200px;"`,
      }),
    path: path,
    not_found_label: "Daftar Produk Prabayar Tripay Tidak Ditemukan",
  });

  return tb;
}

function tripay_prabayar_start(path, url) {
  ajax_default(
    {
      url: Urls("Tripay_prabayar/get_operator_tripay"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      var option = `<option value="0">Pilih Semua Operator</option>`;
      for (let x in e.data) {
        option += `<option value="${e.data[x].id}" >${e.data[x].name}</option>`;
      }
      $("#param_operator_tripay_prabayar").html(option);

      tripay_prabayar(100, path, url);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function tripay_prabayar(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  param["operator"] = $("#param_operator_tripay_prabayar").val();
  param["active"] = $("#param_active_tripay_prabayar").val();
  param["koneksi"] = $("#param_koneksi_tripay_prabayar").val();

  if (input != undefined) {
    param["pageNumber"] = input;
  }

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Produk Prabayar Tripay Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_tripay_prabayar(JSONData) {
  var json = JSON.parse(JSONData);
  var btn = [];
  var koneksi = "<b style='color:red'>Tidak Terkoneksi Ke Produk</b>";
  if (Object.keys(json.koneksi).length > 0) {
    koneksi =
      `<b style='color:green'>` +
      json.koneksi.kode +
      " " +
      json.koneksi.name +
      " <br>(" +
      json.koneksi.operator +
      ")</b>";
    btn[0] = btnDanger({
      title: "Delete Koneksi",
      onClick: ` onclick="delete_koneksi_tripay('${json.id}')" `,
      icon: "fas fa-times",
    });
  } else {
    btn[0] = btnDefault({
      title: "Sinkronisasi Produk Tripay",
      onClick: ` onclick="sinkronisasi_produk_tripay('${json.id}')" `,
      icon: "fas fa-recycle",
    });
  }

  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.operator + " / " + json.type]),
    td_center(["Rp " + numberFormat(json.price)]),
    td_center([json.status == "tersedia" ? "active" : "non active"]),
    td_center([koneksi]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_koneksi_tripay(id) {
  ajax_default(
    {
      url: Urls("Tripay_prabayar/delete_koneksi"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      tripay_prabayar(100, "tripay_prabayar", "Tripay_prabayar");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function sinkronisasi_produk_tripay(id) {
  ajax_default(
    {
      url: Urls("Tripay_prabayar/info_sinkronisasi_produk_tripay"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Sinkronisasi Produk Tripay",
        type: "blue",
        theme: "material",
        content: form_sinkronisasi_produk_tripay(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Sinkronisasi Produk IAK",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Tripay_prabayar/sinkronisasi_produk_tripay"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  iak_prabayar(100, "tripay_prabayar", "Tripay_prabayar");
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

function form_sinkronisasi_produk_tripay(id, JSONData) {
  const json = JSON.parse(JSONData);
  var option = `<option value="0">Pilih Produk</option>`;
  for (let x in json) {
    option += `<option value="${json[x].id}">${json[x].kode} ${json[x].name} <--> (${json[x].operator})</option>`;
  }

  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Daftar Produk</label>
                              <select class="form-control js-example-tags" name="produk" id="produk" placeholder="Daftar Produk">
                                ${option}
                              </select>
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

function update_produk_prabayar_tripay() {
  ajax_default(
    {
      url: Urls("Tripay_prabayar/update_produk_prabayar_tripay"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}
