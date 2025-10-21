function tes_produk_index(path, url) {
  const tab = tables({
    width: [10, 30, 20, 30, 10],
    columns: [
      { title: "Kode", center: true },
      { title: "Info Seller", center: true },
      { title: "Harga", center: true },
      { title: "Info Pengiriman", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "KODE PRODUK SELLER",
      width: 350,
      onclick: `onClick="tripay_prabayar(100, '${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Tes Produk Seller Digiflaz Tidak Ditemukan",
  });

  var tb = `<div class="col-3 py-3">
              <form id="form-big" class="formName" enctype="multipart/form-data" method="post">
                  <div class="card">
                    <div class="card-body ">
                        <div class="row" >
                          <div class="col-12">
                              <div class="form-group">
                                <label style="display:block">Seller</label>
                                <select class="form-control js-example-tags w-100" name="seller" id="seller" onChange="get_produk_seller()">
                                    <option value="0">Pilih Seller</option>
                                </select>
                              </div>
                              <div class="form-group">
                                <label style="display:block">Produk Seller</label>
                                <select class="form-control js-example-tags w-100" name="produk_seller" id="produk_seller">
                                    <option value="0">Pilih Produk Seller (0 Produk)</option>
                                </select>
                              </div>
                              <div class="form-group">
                                <label>Nomor Tujuan</label>
                                <div class="input-group">
                                  <div class="input-group-prepend">
                                    <span class="input-group-text" style="font-size: 12px;">+62</span>
                                  </div>
                                  <input type="number" class="form-control" placeholder="Nomor Tujuan" name="nomor_tujuan" id="nomor_tujuan">
                                </div>
                              </div>
                              <div class="form-group text-right mt-4 mb-0">
                                <button class="btn btn-secondary" type="submit" onclick="update_produk_prabayar_tripay()" title="Tes">
                                    <i class="fas fa-check-double"></i> Tes
                                </button>
                              </div>
                          </div>
                        </div>
                    </div>
                  </div>
              </form>
              <script>
                  $(".js-example-tags").select2({
                    tags: true
                  });
              </script>
            </div>
            <div class="col-9 py-3">
              <div class="row" >
                  <div class="col-4">
                    <div class="small-box bg-secondary">
                      <div class="inner">
                        <h3  style="font-size: 30px;">Saldo Digiflaz</h3>
                        <p id="saldo">Rp 0,-</p>
                      </div>
                      <div class="icon"><i class="fas fa-info-circle"></i></div>
                    </div>
                  </div>
                  ${tab}
              </div>
            </div>`;

  return tb;
}

function tes_produk_start(path, url) {
  ajax_default(
    {
      url: Urls("Tes_produk/info_tes"),
      method: "get",
    },
    function (e, xhr) {
      var list_seller = `<option value="0">Pilih Seller</option>`;
      for (let x in e.data) {
        list_seller += `<option value="${e.data[x].id}">${e.data[x].name}</option>`;
      }
      $("#seller").html(list_seller);
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );

  ajax_default(
    {
      url: Urls("Tes_produk/info_saldo_digiflaz"),
      method: "get",
    },
    function (e, xhr) {
      $("#saldo").html("Rp " + numberFormat(e.data));
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );

  tes_produk(100, path, url);
}

function tes_produk(perpage, path, url, input) {
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
      '<td colspan="7"><center>Daftar Bank Transfer Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_tes_produk(JSONData) {
  var json = JSON.parse(JSONData);
  btn = [];
  if (json.status_seller != "banned") {
    if (json.validasi == false) {
      btn[0] = btnDefault({
        title: "Validasi Seller",
        onClick: ` onclick="validasi_seller('${json.id}')" `,
        icon: "fas fa-check-double",
      });
    }
    btn[1] = btnDanger({
      title: "Blok Seller",
      onClick: ` onclick="blok_seller_transaksi_tes('${json.id}')" `,
      icon: "fas fa-ban",
    });
  }
  btn[2] = btnDanger({
    title: "Delete Transaksi",
    onClick: ` onclick="delete_transaksi_tes('${json.id}')" `,
    icon: "fas fa-times",
  });

  var obj_info_seller = [
    {
      title: "NAMA SELLER",
      value: json.nama_seller,
    },
    {
      title: "NAMA PRODUK SELLER",
      value: json.produk_name,
    },
  ];

  var obj_info_waktu = [
    {
      title: "STATUS",
      value:
        json.status == "proses"
          ? "<b style='color:orange;'>PROSES</b>"
          : json.status == "gagal"
          ? "<b style='color:red;'>GAGAL</b>"
          : "<b style='color:green;'>SUKSES</b>",
    },
    {
      title: "SALDO BEFORE",
      value: "Rp " + numberFormat(json.saldo_before),
    },
    {
      title: "SALDO AFTER",
      value: "Rp " + numberFormat(json.saldo_after),
    },
    {
      title: "WAKTU KIRIM",
      value: json.waktu_kirim,
    },
    {
      title: "WAKTU UPDATE",
      value: json.updatedAt,
    },
  ];

  var info_waktu = simpleTableFunc(obj_info_waktu, "50");
  var info_seller = simpleTableFunc(obj_info_seller, "50");
  var html = tr(
    [
      td_center([json.kode]),
      td_center([info_seller]),
      td_center(["Rp " + numberFormat(json.harga)]),
      td_center([info_waktu]),
      td(btn, 'style="text-align:right;"'),
    ],
    json.status_seller == "banned" ? `style="background-color:#ffc0c061;"` : ""
  );
  return html;
}

function get_produk_seller() {
  const seller_id = $("#seller").val();
  if (seller_id != 0) {
    ajax_default(
      {
        url: Urls("Tes_produk/get_produk_seller"),
        method: "post",
        data: { seller_id: $("#seller").val() },
      },
      function (e, xhr) {
        var list = ``;
        var num = 0;
        for (let x in e.data) {
          list += `<option value="${e.data[x].id}">${
            e.data[x].name
          } (Rp ${numberFormat(e.data[x].price)})</option>`;
          num++;
        }
        var list_produk_seller = `<option value="0">Pilih Produk Seller (${num} Produk)</option>`;
        list_produk_seller += list;
        $("#produk_seller").html(list_produk_seller);
      },
      function (status, errMsg) {
        frown_alert(errMsg.error_msg);
      }
    );
  } else {
    var list_produk_seller = `<option value="0">Pilih Produk Seller (0 Produk)</option>`;
    $("#produk_seller").html(list_produk_seller);
  }
}

function delete_transaksi_tes(id) {
  ajax_default(
    {
      url: Urls("Tes_produk/delete_transaksi_tes"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      tes_produk(100, "tes_produk", "Tes_produk");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function blok_seller_transaksi_tes(id) {
  ajax_default(
    {
      url: Urls("Tes_produk/blok_seller_transaksi_tes"),
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
}

function validasi_seller(id) {
  ajax_default(
    {
      url: Urls("Tes_produk/validasi_seller"),
      method: "post",
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      riwayat_validasi_seller(
        100,
        "riwayat_validasi_seller",
        "Riwayat_validasi_seller"
      );
      daftar_seller(100, "daftar_seller", "Daftar_seller");
      tes_produk(100, "tes_produk", "Tes_produk");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}
