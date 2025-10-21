function daftar_member_index(path, url) {
  var tb = tables({
    width: [10, 15, 15, 15, 15, 15, 15],
    columns: [
      { title: "Kode", center: true },
      { title: "Nama Member", center: true },
      { title: "Nomor Whatsapp", center: true },
      { title: "Saldo", center: true },
      { title: "Status Member", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      btn_primary({
        label: "Tambah Member",
        title: "Tambah Member Baru",
        icon: "fas fa-user",
        onclick: "add_new_member",
      }) +
      search_btn({
        placeholder: "KODE / NAMA / WHATSAPP NUMBER / NAME MEMBER",
        width: 450,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }),
    path: path,
    not_found_label: "Daftar Member Tidak Ditemukan",
  });

  return tb;
}

function daftar_member_start(path, url) {
  daftar_member(100, path, url);
}

function daftar_member(perpage, path, url, input) {
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
      '<td colspan="7"><center>Daftar Member Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_member(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  if (json.agen_status != "agen") {
    btn[0] = btnPrimary({
      title: "Jadikan Member Sebagai Agen",
      onClick: ` onclick="become_agen('${json.id}')" `,
      icon: "fas fa-user-tie",
    });
  }
  btn[1] = btnDefault({
    title: "Tambah Saldo",
    onClick: ` onclick="tambah_saldo('${json.id}')" `,
    icon: "fas fa-money-bill-wave-alt",
  });
  btn[2] = btnDefault({
    title: "Transfer Saldo",
    onClick: ` onclick="transfer_saldo('${json.id}')" `,
    icon: "fas fa-money-bill-alt",
  });
  btn[3] = btnDefault({
    title: "Edit Daftar Member",
    onClick: ` onclick="edit_daftar_member('${json.id}')" `,
    icon: "fas fa-pencil-alt",
  });
  btn[4] = btnDanger({
    title: "Delete Daftar Member",
    onClick: ` onclick="delete_daftar_member('${json.id}')" `,
    icon: "fas fa-times",
  });

  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.whatsapp_number]),
    td_center(["Rp " + numberFormat(json.saldo)]),
    td_center([
      "<b>" +
        (json.status == "verified" ? "TERVERIFIKASI" : "BELUM TERVERIFIKASI") +
        "</b>",
    ]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_daftar_member(id) {
  ajax_default(
    {
      url: Urls("Daftar_member/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_member_start("daftar_member", "Daftar_member");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function edit_daftar_member(id) {
  ajax_default(
    {
      url: Urls("Daftar_member/info_edit"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Edit Data Member",
        type: "blue",
        theme: "material",
        content: form_update_member(JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Perbaharui Member",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Daftar_member/update"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  daftar_member_start("daftar_member", "Daftar_member");
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

function form_update_member(JSONValue) {
  var id = "";
  var kode = "";
  var fullname = "";
  var nomor_whatsapp = "";

  if (JSONValue != undefined) {
    var value = JSON.parse(JSONValue);
    id = `<input type="hidden" name="id" value="${value.id}">`;
    kode = value.kode;
    fullname = value.fullname;
    nomor_whatsapp = value.whatsapp_number;
  }

  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          ${id}
                          <div class="form-group">
                              <label>Kode</label>
                              <input type="text" class="form-control" value="${kode}" placeholder="Kode Member" disabled="">
                          </div>
                          <div class="form-group">
                              <label>Nama Lengkap Member</label>
                              <input type="text" class="form-control" name="name" value="${fullname}" placeholder="Nama Lengkap Member" >
                          </div>
                          <div class="form-group">
                              <label>Nomor Whatsapp Member</label>
                              <input type="text" class="form-control" name="whatsapp_number" value="${nomor_whatsapp}" placeholder="Nomor Whatsapp Member" >
                          </div>
                          <div class="form-group">
                              <label>Password</label>
                              <input type="password" class="form-control" name="password"  placeholder="Password" >
                          </div>
                          <div class="form-group">
                              <label>Konfirmasi</label>
                              <input type="password" class="form-control" name="konfirmasi_password" placeholder="Konfirmasi Password" >
                          </div>
                      </div>
                  </div>
              </form>`;
  return form;
}

function become_agen(id) {
  ajax_default(
    {
      url: Urls("Daftar_member/become_agen"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_member_start("daftar_member", "Daftar_member");
      daftar_agen_start("daftar_agen", "Daftar_agen");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}

function transfer_saldo(id) {
  ajax_default(
    {
      url: Urls("Daftar_member/info_transfer_saldo"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Transfer Saldo",
        type: "blue",
        theme: "material",
        content: form_transfer_saldo_member(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Transfer Saldo",
            btnClass: "btn-primary",
            action: function () {
              var saldo_sekarang = $("#saldo_sekarang").val();
              var saldo_yang_ditransfer = hide_currency(
                $("#saldo_yang_ditransfer").val()
              );
              var target_transfer = $("#target_transfer").val();
              var error = false;
              var message = "";
              if (saldo_yang_ditransfer > saldo_sekarang) {
                error = true;
                message += `<li>Saldo transfer tidak boleh lebih besar dari saldo sekarang.</li>`;
              }
              if (target_transfer == 0) {
                error = true;
                message += `<li>Untuk melanjutkan, silahkan pilih salah satu member yang akan dijadikan tujuan transfer.</li>`;
              }
              if (error) {
                frown_alert(`<ul class="pl-3">${message}</ul>`);
                return false;
              } else {
                ajax_default(
                  {
                    url: Urls("Daftar_member/transfer_saldo"),
                    method: "post",
                    form: true,
                  },
                  function (e, xhr) {
                    smile_alert(e.error_msg);
                    daftar_member_start("daftar_member", "Daftar_member");
                    riwayat_transfer_saldo_start(
                      "riwayat_transfer_saldo",
                      "Riwayat_transfer_saldo"
                    );
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

function form_transfer_saldo_member(id, JSONData) {
  var json = JSON.parse(JSONData);

  var option = `<option value="0">Pilih Member</option>`;
  for (let x in json.list) {
    option += `<option value="${json.list[x].id}">${json.list[x].name}</option>`;
  }
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Saldo Sekarang</label>
                              <input type="text" class="form-control" 
                              value="Rp ${numberFormat(
                                json.saldo
                              )}" placeholder="Kode Member" disabled="">
                              <input type="hidden" value="${
                                json.saldo
                              }" name="saldo_sekarang" id="saldo_sekarang" >
                          </div>
                          <div class="form-group">
                              <label>Member Target Transfer</label>
                              <select class="form-control js-example-tags" name="target_transfer" id="target_transfer" >
                                ${option}
                              </select>
                          </div>
                          <div class="form-group">
                              <label>Saldo yang Ditransfer</label>
                              <input type="text" class="form-control currency" name="saldo_yang_ditransfer" id="saldo_yang_ditransfer" placeholder="Saldo yang Ditransfer" >
                          </div>
                      </div>
                  </div>
              </form>
              <script>
                  $(".js-example-tags").select2({
                    tags: true
                  });
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

function tambah_saldo(id) {
  $.confirm({
    columnClass: "col-5",
    title: "Tambah Saldo Member",
    type: "blue",
    theme: "material",
    content: form_tambah_saldo_member(id),
    closeIcon: false,
    buttons: {
      tutup: function () {
        return true;
      },
      formSubmit: {
        text: "Tambah Saldo Membr",
        btnClass: "btn-primary",
        action: function () {
          var nominal = hide_currency($("#nominal").val());

          if (nominal <= 0) {
            frown_alert(`Nominal Tidak Boleh Rp 0`);
            return false;
          } else {
            ajax_default(
              {
                url: Urls("Daftar_member/tambah_saldo_member"),
                method: "post",
                form: true,
              },
              function (e, xhr) {
                smile_alert(e.error_msg);
                daftar_member_start("daftar_member", "Daftar_member");
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

function form_tambah_saldo_member(id) {
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Nominal Saldo yang Ditamhahkan</label>
                              <input type="text" class="form-control currency" name="nominal" id="nominal" placeholder="Nominal Saldo yang Ditambahkan" >
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
