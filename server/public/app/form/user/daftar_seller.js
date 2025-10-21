function daftar_seller_index(path, url) {
  var tb = tables({
    width: [20, 15, 15, 15, 10, 15, 10],
    columns: [
      { title: "Nama Seller", center: true },
      { title: "Status", center: true },
      { title: "Jumlah Produk", center: true },
      { title: "Rangking", center: true },
      { title: "Validasi", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      search_btn({
        placeholder: "NAMA SELLER",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "status_seller",
        option: [
          { id: "semua", value: "Semua Status" },
          { id: "terblokir", value: "Terblokir" },
          { id: "tidak_terblokir", value: "Tidak Terblokir" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }),
    path: path,
    not_found_label: "Daftar Seller Tidak Ditemukan",
  });

  return tb;
}

function daftar_seller_start(path, url) {
  daftar_seller(100, path, url);
}

function daftar_seller(perpage, path, url, input) {
  var param = [];
  param["status_seller"] = $("#status_seller").val();
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
      '<td colspan="7"><center>Daftar Agen Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_seller(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnPrimary({
    title: "Update Rangking Seller",
    onClick: ` onclick="update_rangking_seller('${json.id}')" `,
    icon: "fas fa-star",
  });
  if (json.status == "banned") {
    btn[1] = btnSuccess({
      title: "Buka Blokir Seller",
      onClick: ` onclick="buka_blokir_seller('${json.id}')" `,
      icon: "fas fa-ban",
    });
  } else {
    btn[1] = btnDanger({
      title: "Blokir Seller",
      onClick: ` onclick="blok_seller('${json.id}')" `,
      icon: "fas fa-ban",
    });
  }
  btn[2] = btnDanger({
    title: "Delete Daftar Seller",
    onClick: ` onclick="delete_seller('${json.id}')" `,
    icon: "fas fa-times",
  });

  var rangking = "";

  for (let index = 0; index < 5; index++) {
    if (index < json.rangking) {
      rangking += `<i class="fas fa-star mx-auto" style="font-size: 11px;color: gold;"></i>`;
    } else {
      rangking += `<i class="fas fa-star mx-auto" style="font-size: 11px;"></i>`;
    }
  }

  // console.log("___________________________");
  // console.log(json.rangking);
  // console.log("___________________________");

  var html = tr(
    [
      td_center([json.name], 'style="vertical-align: middle;"'),
      td_center(
        [
          json.status == "banned"
            ? `<b style="color:red;">Seller Di Blokir</b>`
            : `<b style="color:green;">Seller Tidak Di Blokir</b>`,
        ],
        'style="vertical-align: middle;"'
      ),
      td_center(
        [
          `<b ${json.jumlah_produk == 0 ? `style="color:red;"` : ""} >` +
            json.jumlah_produk +
            " Produk</b>",
        ],
        'style="vertical-align: middle;"'
      ),
      td_center([rangking], 'style="vertical-align: middle;"'),
      td_center(
        [
          json.validasi == true
            ? "<b style='color:green'>Tervalidasi</b>"
            : "<b style='color:red'>Belum Tervalidasi</b>",
        ],
        'style="vertical-align: middle;"'
      ),
      td_center([json.updatedAt], 'style="vertical-align: middle;"'),
      td_center(btn, 'style="text-align:right;vertical-align: middle;"'),
    ],
    json.rangking != 5
      ? json.rangking == 4
        ? `style="background-color:#ffa50087"`
        : `style="background-color:#ffe4e4"`
      : ""
  );
  return html;
}

function update_rangking_seller(id) {
  ajax_default(
    {
      url: Urls("Daftar_seller/get_info_rangking_seller"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-4",
        title: "Update Rangking Seller",
        type: "blue",
        theme: "material",
        content: form_update_rangking_seller(id, e.data),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Update Rangking Seller",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Daftar_seller/update_rangking_seller"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  daftar_seller(100, "daftar_seller", "Daftar_seller");
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

function form_update_rangking_seller(id, JSONData) {
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Rangking Seller</label>
                              <input type="text" name="rangking" class="form-control" value="${JSONData}" >
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}

function blok_seller(id) {
  $.confirm({
    columnClass: "col-4",
    title: "Peringatan",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin untuk memblokir seller ini?.",
    closeIcon: false,
    buttons: {
      tidak: function () {
        return true;
      },
      iya: {
        text: "Iya",
        btnClass: "btn-primary",
        action: function () {
          ajax_default(
            {
              url: Urls("Daftar_seller/blokir_seller"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              daftar_seller(100, "daftar_seller", "Daftar_seller");
              tes_produk(100, "tes_produk", "Tes_produk");
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

function buka_blokir_seller(id) {
  ajax_default(
    {
      url: Urls("Daftar_seller/buka_blokir_seller"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_seller(100, "daftar_seller", "Daftar_seller");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function delete_seller(id) {
  $.confirm({
    columnClass: "col-4",
    title: "Peringatan",
    type: "blue",
    theme: "material",
    content: "Apakah anda yakin untuk menghapus seller ini?.",
    closeIcon: false,
    buttons: {
      tidak: function () {
        return true;
      },
      iya: {
        text: "Iya",
        btnClass: "btn-primary",
        action: function () {
          ajax_default(
            {
              url: Urls("Daftar_seller/delete_seller"),
              method: "post",
              data: { id: id },
            },
            function (e, xhr) {
              smile_alert(e.error_msg);
              daftar_seller(100, "daftar_seller", "Daftar_seller");
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
