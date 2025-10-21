function digiflaz_prabayar_index(path, url) {
  var tb = tables({
    width: [8, 25, 10, 25, 10, 13, 9],
    columns: [
      { title: "Kode", center: true },
      { title: "Info Produk", center: true },
      { title: "Harga", center: true },
      { title: "Info Seller", center: true },
      { title: "Status", center: true },
      { title: "Koneksi", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Update Produk Digiflaz",
        title: "Update Produk Digiflaz",
        icon: "fas fa-recycle",
        onclick: "update_produk_prabayar_digiflaz",
      }) +
      btn_primary({
        label: "Pilih Produk Seller Terbaik",
        title: "Pilih Produk Seller Terbaik",
        icon: "fas fa-user",
        onclick: "pilih_produk_seller_terbaik",
        class: "mx-2",
      }) +
      search_btn({
        placeholder: "KODE DIGIFLAZ",
        width: 250,
        onclick: `onClick="digiflaz_prabayar(100, '${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "param_koneksi_digiflaz",
        option: [
          { id: "semua", value: "Semua" },
          { id: "sudah_konek", value: "Sudah Konek" },
          { id: "belum_konek", value: "Belum Konek" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_active_digiflaz",
        option: [
          { id: "active", value: "Aktif" },
          { id: "inactive", value: "Non Aktif" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }) +
      selectFN({
        name_id: "param_type_digiflaz",
        option: [{ id: "0", value: "Pilih Semua Type" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 150px;"`,
      }) +
      selectFN({
        name_id: "param_brand_digiflaz",
        option: [{ id: "0", value: "Pilih Semua Brand" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 150px;"`,
      }) +
      selectFN({
        name_id: "param_kategori_digiflaz",
        option: [{ id: "0", value: "Pilih Semua Kategori" }],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 150px;"`,
      }),
    path: path,
    not_found_label: "Daftar Digiflaz Prabayar Tidak Ditemukan",
  });

  return tb;
}

function digiflaz_prabayar_start(path, url) {
  ajax_default(
    {
      url: Urls("Digiflaz_prabayar/get_param_digiflaz"),
      method: "get",
      loader: true,
    },
    function (e, xhr) {
      var option_kategori = `<option value="0">Pilih Semua Kategori</option>`;
      for (let x in e.data.category) {
        option_kategori += `<option value="${e.data.category[x].id}" >${e.data.category[x].name}</option>`;
      }
      $("#param_kategori_digiflaz").html(option_kategori);

      var option_brand = `<option value="0">Pilih Semua Brand</option>`;
      for (let x in e.data.brand) {
        option_brand += `<option value="${e.data.brand[x].id}" >${e.data.brand[x].name}</option>`;
      }
      $("#param_brand_digiflaz").html(option_brand);

      var option_type = `<option value="0">Pilih Semua Type</option>`;
      for (let x in e.data.type) {
        option_type += `<option value="${e.data.type[x].id}" >${e.data.type[x].name}</option>`;
      }
      $("#param_type_digiflaz").html(option_type);

      digiflaz_prabayar(100, path, url);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function digiflaz_prabayar(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  param["type"] = $("#param_type_digiflaz").val();
  param["brand"] = $("#param_brand_digiflaz").val();
  param["kategori"] = $("#param_kategori_digiflaz").val();
  param["active"] = $("#param_active_digiflaz").val();
  param["koneksi"] = $("#param_koneksi_digiflaz").val();

  if (input != undefined) {
    param["pageNumber"] = input;
  }

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Digiflaz Prabayar Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_digiflaz_prabayar(JSONData) {
  var json = JSON.parse(JSONData);

  if (tempVar["list_seller"] == undefined) {
    tempVar["list_seller"] = { [json.id]: json.seller };
  } else {
    tempVar["list_seller"][json.id] = json.seller;
  }

  var btn = [];
  btn[0] = btnDefault({
    title: "Pilih Seller Secara Manual",
    onClick: ` onclick="pilih_manual_seller('${json.id}', '${json.name}')" `,
    icon: "fas fa-user",
  });

  var koneksi = "<b style='color:red'>Tidak Terkoneksi Ke Produk</b>";
  if (Object.keys(json.koneksi).length > 0) {
    koneksi =
      `<b style='color:green'>` +
      json.koneksi.kode +
      " <br>" +
      json.koneksi.name +
      " <br>(" +
      json.koneksi.operator +
      ")</b>";
    btn[1] = btnDanger({
      title: "Delete Koneksi",
      onClick: ` onclick="delete_koneksi_digiflaz('${json.id}')" `,
      icon: "fas fa-times",
    });
  } else {
    btn[1] = btnDefault({
      title: "Sinkronisasi Produk Digiflaz",
      onClick: ` onclick="sinkronisasi_produk_digiflaz('${json.id}')" `,
      icon: "fas fa-recycle",
    });
  }

  var obj_info_product = [
    { title: "NAMA", value: "<b>#" + json.name + "</b>" },
    { title: "KATEGORI", value: "<b>#" + json.kategori + "</b>" },
    { title: "BRAND", value: "<b>#" + json.brand + "</b>" },
    { title: "TIPE", value: "<b>#" + json.type + "</b>" },
  ];

  var obj_info_seller = [
    {
      title: "JUMLAH SELLER",
      value: `<b>${json.seller.length} Seller <i class="fas fa-user ml-1" style="font-size: 11px;"></i></b>`,
    },
    { title: "START CUT OFF", value: "23:45:00" },
    { title: "END CUT OFF", value: "00:30:00" },
    {
      title: "DAFTAR SELLER",
      value: `<button type="button" class="btn btn-primary btn-sm" onclick='listSellerPerProduk(${json.id}, "${json.name}")'>
                  <i class="fas fa-user"></i> Daftar Seller
              </button>`,
    },
  ];

  var info_product = simpleTableFunc(obj_info_product, "30");
  var info_seller = simpleTableFunc(obj_info_seller, "45");
  const times = json.updatedAt.split(" ");
  var html = tr([
    td_center([json.kode + "<br>" + times[0] + "<br>" + times[1]]),
    td_center([info_product]),
    td_center(["Rp " + numberFormat(json.price)]),
    td_center([info_seller]),
    td_center([json.status]),
    td_center([koneksi]),
    td_center(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function listSellerPerProduk(id, name) {
  $.confirm({
    columnClass: "col-7",
    title:
      "Daftar Seller Produk <span style='color:#859cb3'>" + name + "</span>",
    type: "blue",
    theme: "material",
    content: form_list_seller(id),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
    },
  });
}
function form_list_seller(id) {
  var JSONData = tempVar["list_seller"][id];
  var feedHeader = thead(
    tr([
      th_center("No", `class="py-2 px-3 align-middle" style="width:10%;"`),
      th_center(
        "Nama Seller",
        `class="py-2 px-3 align-middle" style="width:45%;"`
      ),
      th_center("Harga", `class="py-2 px-3 align-middle" style="width:30%;"`),
      th_center(
        "Selected",
        `class="py-2 px-3 align-middle" style="width:15%;"`
      ),
    ])
  );
  var feedBody = "";
  var no = 1;
  for (let x in JSONData) {
    feedBody += tr(
      [
        td_center(
          no.toString(),
          `class=" py-1 px-3 align-middle"`,
          `class="mb-0"`
        ),
        td(
          JSONData[x].seller_name + "<br>" + JSONData[x].seller_code,
          `class="py-1 px-3 align-middle"`,
          `class="mb-0" style="font-weight:normal;"`
        ),
        td_center(
          "Rp " + numberFormat(JSONData[x].seller_price),
          `class="py-1 text-right align-middle" `,
          `class="mb-0"`
        ),
        td_center(
          JSONData[x].seller_selected == "selected"
            ? `<i class="fas fa-check-double"></i>`
            : "",
          `class="py-1 align-middle" `,
          `class="mb-0"`
        ),
      ],
      JSONData[x].seller_selected == "selected"
        ? `style="background-color: #1e364e;color: white;"`
        : ""
    );
    no++;
  }
  feedBody = tbody(feedBody);
  return mytable(feedHeader + feedBody);
}

function pilih_manual_seller(id, name) {
  ajax_default(
    {
      url: Urls("Digiflaz_prabayar/get_info_pilih_seller_manual"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-7",
        title:
          "Pilih Manual Seller Produk <span style='color:#859cb3'>" +
          name +
          "</span>",
        type: "blue",
        theme: "material",
        content: form_pilih_manual_seller(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Simpan Perubahan Seller Manual",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Digiflaz_prabayar/pilih_seller_manual"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  digiflaz_prabayar(
                    100,
                    "digiflaz_prabayar",
                    "Digiflaz_prabayar"
                  );
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

function form_pilih_manual_seller(id, JSONData) {
  var json = JSON.parse(JSONData);
  var feedHeader = thead(
    tr([
      th_center("No", `class="py-2 px-3 align-middle" style="width:10%;"`),
      th_center(
        "Nama Seller",
        `class="py-2 px-3 align-middle" style="width:45%;"`
      ),
      th_center("Harga", `class="py-2 px-3 align-middle" style="width:30%;"`),
      th_center(
        "Selected",
        `class="py-2 px-3 align-middle" style="width:15%;"`
      ),
    ])
  );
  var feedBody = "";
  var no = 1;
  for (let x in json) {
    feedBody += tr(
      [
        td_center(
          no.toString(),
          `class=" py-1 px-3 align-middle"`,
          `class="mb-0"`
        ),
        td(
          json[x].name + "<br>Kode : " + json[x].kode,
          `class="py-1 px-3 align-middle"`,
          `class="mb-0" style="font-weight:normal;"`
        ),
        td_center(
          "Rp " + numberFormat(json[x].price),
          `class="py-1 px-3 align-middle"`,
          `class="mb-0" style="font-weight:normal;"`
        ),
        td(
          `<input class="form-check-input mx-auto" type="radio" name="seller" value="${json[x].id}">`,
          `class="py-1 text-center" `,
          `class="mb-0"`
        ),
      ],
      JSONData[x].seller_selected == "selected"
        ? `style="background-color: #1e364e;color: white;"`
        : ""
    );
    no++;
  }
  feedBody = tbody(feedBody);
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          ${mytable(feedHeader + feedBody)}
                      </div>
                  </div>
              </form>`;
  return form;
}

function delete_koneksi_digiflaz(id) {
  ajax_default(
    {
      url: Urls("Digiflaz_prabayar/delete_koneksi_digiflaz"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      digiflaz_prabayar(100, "digiflaz_prabayar", "Digiflaz_prabayar");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function sinkronisasi_produk_digiflaz(id) {
  ajax_default(
    {
      url: Urls("Digiflaz_prabayar/info_sinkronisasi_produk_digiflaz"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Sinkronisasi Produk Digiflaz",
        type: "blue",
        theme: "material",
        content: form_sinkronisasi_produk_digiflaz(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Sinkronisasi Produk Digiflaz",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Digiflaz_prabayar/sinkronisasi_produk_digiflaz"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  digiflaz_prabayar(
                    100,
                    "digiflaz_prabayar",
                    "Digiflaz_prabayar"
                  );
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

function form_sinkronisasi_produk_digiflaz(id, JSONData) {
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

function update_produk_prabayar_digiflaz() {
  ajax_default(
    {
      url: Urls("Digiflaz_prabayar/update_produk_digiflazz_prabayar"),
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
