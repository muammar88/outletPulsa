function iak_prabayar_index(path, url) {
  var tb = tables({
    width: [5, 20, 10, 10, 10, 20, 20, 5],
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
        label: "Update Produk IAK",
        title: "Update Produk IAK",
        icon: "fas fa-recycle",
        onclick: "update_produk_prabayar_iak",
      }) +
      search_btn({
        placeholder: "KODE PRODUK",
        width: 350,
        onclick: `onClick="iak_prabayar(100, '${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "param_koneksi",
        option: [
          { id: "semua", value: "Semua" },
          { id: "sudah_konek", value: "Sudah Konek" },
          { id: "belum_konek", value: "Belum Konek" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_active",
        option: [
          { id: "active", value: "Aktif" },
          { id: "inactive", value: "Non Aktif" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_operator",
        option: [{ id: "0", value: "Pilih Semua Operator" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 200px;"`,
      }),
    path: path,
    not_found_label: "Daftar Produk Prabayar IAK Tidak Ditemukan",
  });

  return tb;
}

function iak_prabayar_start(path, url) {
  ajax_default(
    {
      url: Urls("Iak_prabayar/get_operator_iak"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      var option = `<option value="0">Pilih Semua Operator</option>`;
      for (let x in e.data) {
        option += `<option value="${e.data[x].id}" >${e.data[x].name}</option>`;
      }
      $("#param_operator").html(option);

      iak_prabayar(100, path, url);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function iak_prabayar(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  param["operator"] = $("#param_operator").val();
  param["active"] = $("#param_active").val();
  param["koneksi"] = $("#param_koneksi").val();

  if (input != undefined) {
    param["pageNumber"] = input;
  }

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Produk Prabayar IAK Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_iak_prabayar(JSONData) {
  const json = JSON.parse(JSONData);
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
      onClick: ` onclick="delete_koneksi_iak('${json.id}')" `,
      icon: "fas fa-times",
    });
  } else {
    btn[0] = btnDefault({
      title: "Sinkronisasi Produk IAK",
      onClick: ` onclick="sinkronisasi_produk_iak('${json.id}')" `,
      icon: "fas fa-recycle",
    });
  }

  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.operator + " / " + json.type]),
    td_center(["Rp " + numberFormat(json.price)]),
    td_center([json.status]),
    td_center([koneksi]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_koneksi_iak(id) {
  ajax_default(
    {
      url: Urls("Iak_prabayar/delete_koneksi"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      iak_prabayar(100, "iak_prabayar", "Iak_prabayar");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function sinkronisasi_produk_iak(id) {
  ajax_default(
    {
      url: Urls("Iak_prabayar/info_sinkronisasi_produk_iak"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Sinkronisasi Produk IAK",
        type: "blue",
        theme: "material",
        content: form_sinkronisasi_produk_iak(id, JSON.stringify(e.data)),
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
                  url: Urls("Iak_prabayar/sinkronisasi_produk_iak"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  iak_prabayar(100, "iak_prabayar", "Iak_prabayar");
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

function form_sinkronisasi_produk_iak(id, JSONData) {
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

function update_produk_prabayar_iak() {
  ajax_default(
    {
      url: Urls("Iak_prabayar/update_produk_prabayar_iak"),
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
