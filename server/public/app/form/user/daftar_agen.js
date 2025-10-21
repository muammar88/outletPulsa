function daftar_agen_index(path, url) {
  var tb = tables({
    width: [10, 20, 15, 15, 15, 15, 10],
    columns: [
      { title: "Kode Agen", center: true },
      { title: "Nama Agen", center: true },
      { title: "Nomor Whatsapp", center: true },
      { title: "Jumlah Kostumer", center: true },
      { title: "Fee Agen", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools: search_btn({
      placeholder: "KODE AGEN",
      width: 450,
      onclick: `onClick="${path}_start('${path}', '${url}')"`,
      path: path,
    }),
    path: path,
    not_found_label: "Daftar Agen Tidak Ditemukan",
  });

  return tb;
}

function daftar_agen_start(path, url) {
  daftar_agen(100, path, url);
}

function daftar_agen(perpage, path, url, input) {
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
      '<td colspan="7"><center>Daftar Agen Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_agen(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];
  btn[0] = btnDefault({
    title: "Tambah Kostumer",
    onClick: ` onclick="add_kostumer_agen('${json.id}')" `,
    icon: "fas fa-user-plus",
  });
  btn[1] = btnDefault({
    title: "Pembayaran Fee Agen",
    onClick: ` onclick="pembayaran_fee_agen('${json.id}')" `,
    icon: "fas fa-money-bill-alt",
  });
  btn[2] = btnDanger({
    title: "Delete Daftar Agen",
    onClick: ` onclick="delete_daftar_agen('${json.id}')" `,
    icon: "fas fa-times",
  });

  var html = tr([
    td_center([json.kode]),
    td_center([json.name]),
    td_center([json.whatsapp_number]),
    td_center([json.jumlah_konsumen + " Akun"]),
    td_center(["Rp " + numberFormat(json.fee_agen)]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:right;"'),
  ]);
  return html;
}

function delete_daftar_agen(id) {
  ajax_default(
    {
      url: Urls("Daftar_agen/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      daftar_agen_start("daftar_agen", "Daftar_agen");
      daftar_member_start("daftar_member", "Daftar_member");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function add_kostumer_agen(id) {
  ajax_default(
    {
      url: Urls("Daftar_agen/info_add_kostumer_agen"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Tambahkan Kostumer Baru Pada Agen",
        type: "blue",
        theme: "material",
        content: form_add_kostumer_agen(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Tambahkan Kostumer Baru Pada Agen",
            btnClass: "btn-primary",
            action: function () {
              ajax_default(
                {
                  url: Urls("Daftar_agen/add_kostumer_agen"),
                  method: "post",
                  form: true,
                },
                function (e, xhr) {
                  smile_alert(e.error_msg);
                  daftar_agen_start("daftar_agen", "Daftar_agen");
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

function form_add_kostumer_agen(id, JSONData) {
  const json = JSON.parse(JSONData);
  var option = option_gen({ default: "Pilih Kostumer", data: json });
  var id = `<input type="hidden" name="id" id="id"  value="${id}">`;
  var form = myForm([
    col_12(id),
    col_12(
      select({
        label: "Daftar Kostumer",
        id_name: "kostumer",
        placeholder: "Daftar Kostumer",
        option: option,
      })
    ),
  ]);
  form += `<script>
            $(".js-example-tags").select2({
              tags: true
            });
          </script>`;

  return form;
}

// var option = `<option value="0">Pilih Kostumer</option>`;
// for (let x in json) {
//   option += `<option value="${json[x].id}">${json[x].name} -- (${json[x].whatsapp_number})</option>`;
// }

// var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
//                 <div class="row px-0 py-3 mx-0">
//                     <div class="col-12">
//                         <input type="hidden" name="id" value="${id}">
//                         <div class="form-group">
//                             <label>Daftar Kostumer</label>
//                             <select class="form-control js-example-tags" name="kostumer" id="kostumer" placeholder="Daftar Kostumer">
//                               ${option}
//                             </select>
//                         </div>
//                     </div>
//                 </div>
//             </form>
//             <script>
//               $(".js-example-tags").select2({
//                 tags: true
//               });
//             </script>
//            `;
// return form;
// col_12(
//   input_text({
//     label: "Nama Bank",
//     id_name: "name",
//     value: name,
//     placeholder: "Nama Bank",
//   })
// ),
// col_12(
//   input_file({
//     label: "Upload Image",
//     id_name: "photo",
//     placeholder: "Upload Image Bank",
//     note: "Dimensi maksimal 100x100 pixel.",
//   })
// ),

function pembayaran_fee_agen(id) {
  ajax_default(
    {
      url: Urls("Daftar_agen/info_pembayaran_fee_agen"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      $.confirm({
        columnClass: "col-5",
        title: "Pembayaran Fee Agen",
        type: "blue",
        theme: "material",
        content: form_info_pembayaran_fee_agen(id, JSON.stringify(e.data)),
        closeIcon: false,
        buttons: {
          tutup: function () {
            return true;
          },
          formSubmit: {
            text: "Bayar Fee Agen",
            btnClass: "btn-primary",
            action: function () {
              var paid_fee = hide_currency($("#fee").val());
              var fee = parseInt($("#fee_agen").val());
              var withdraw_type = $("#withdraw_type").val();
              var error = false;
              var message = "";
              if (paid_fee > fee) {
                error = true;
                message +=
                  "<li>Fee yang dibayarkan tidak boleh dari <b>FEE AGEN</b>!!!.</li>";
              }
              if (withdraw_type == 0) {
                error = true;
                message +=
                  "<li>Silahkan pilih terlebih dahulu <b>TIPE WITHDRAW</b> yang akan anda lakukan.</li>";
              }
              // filter error at frontend
              if (error == true) {
                frown_alert(`<ul class="pl-3">${message}</ul>`);
                return false;
              } else {
                ajax_default(
                  {
                    url: Urls("Daftar_agen/pembayaran_fee_agen"),
                    method: "post",
                    form: true,
                  },
                  function (e, xhr) {
                    smile_alert(e.error_msg);
                    daftar_agen_start("daftar_agen", "Daftar_agen");
                    daftar_member_start("daftar_member", "Daftar_member");
                    riwayat_fee_agen_start(
                      "riwayat_fee_agen",
                      "Riwayat_fee_agen"
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

function form_info_pembayaran_fee_agen(id, JSONData) {
  var form = `<form id="form" class="formName" enctype="multipart/form-data" method="post">
                  <div class="row px-0 py-3 mx-0">
                      <div class="col-12">
                          <input type="hidden" name="id" value="${id}">
                          <div class="form-group">
                              <label>Fee Yang Dibayarkan</label>
                              <input type="text" class="form-control" 
                                value="Rp ${numberFormat(JSONData)}" 
                                placeholder="Fee Agen" disabled="" >
                              <input type="hidden" id="fee_agen" value="${JSONData}" >
                          </div>
                          <div class="form-group">
                              <label>Jenis Withdraw</label>
                              <select class="form-control" name="withdraw_type" id="withdraw_type">
                                <option value="0">Pilih Jenis Withdraw</option>
                                <option value="withdraw_cash">Withdraw Cash</option>
                                <option value="withdraw_saldo">Withdraw Ke Saldo</option>
                              </select>
                          </div>
                          <div class="form-group">
                              <label>Fee Yang Dibayarkan</label>
                              <input type="text" class="form-control currency" name="fee" id="fee" placeholder="Fee Agen yang akan dibayarkan" >
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
               </script>
             `;
  return form;
}
