function riwayat_fee_agen_index(path, url) {
  var tb = tables({
    width: [5, 15, 8, 8, 8, 15, 20, 16, 5],
    columns: [
      { title: "Kode", center: true },
      { title: "Info Agen", center: true },
      { title: "Debet", center: true },
      { title: "Kredits", center: true },
      { title: "Status", center: true },
      { title: "Fee Agen", center: true },
      { title: "Keterangan", center: true },
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
    not_found_label: "Riwayat Fee Agen Tidak Ditemukan",
  });

  return tb;
}

function riwayat_fee_agen_start(path, url) {
  riwayat_fee_agen(100, path, url);
}

function riwayat_fee_agen(perpage, path, url, input) {
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
      '<td colspan="9"><center>Riwayat Fee Agen Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_riwayat_fee_agen(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];

  btn[0] = btnDanger({
    title: "Delete Riwayat Fee Agen",
    onClick: ` onclick="delete_riwayat_fee_agen('${json.id}')" `,
    icon: "fas fa-times",
  });

  var fee_agen = tr([
    td_center(
      `Fee Sebelum`,
      `class="border py-2 px-3" style="width:50%;color: #fff;background-color: #5a6268;"`,
      `class="mb-0"`
    ),
    td(
      "Rp " + numberFormat(json.fee_agen_sebelum),
      `class="border py-2 text-right" `,
      `style="font-weight:normal;" class="mb-0"`
    ),
  ]);

  fee_agen += tr([
    td_center(
      `Fee Sesudah`,
      `class="border py-2 px-3" style="color: #fff;background-color: #5a6268;"`,
      `class="mb-0"`
    ),
    td(
      "Rp " + numberFormat(json.fee_agen_sesudah),
      `class="border py-2  text-right"`,
      `style="font-weight:normal;" class="mb-0"`
    ),
  ]);

  var fee_agen = tbody(fee_agen);

  var html = tr([
    td_center([json.kode]),
    td_center([json.member_name, "<br>", json.whatsapp_number]),
    td_center(["Rp " + numberFormat(json.debet)]),
    td_center(["Rp " + numberFormat(json.kredit)]),
    td_center([json.status]),
    td_center([mytable(fee_agen)]),
    td_center([json.ket]),
    td_center([json.updatedAt]),
    td(btn, 'style="text-align:center;"'),
  ]);
  return html;
}

function delete_riwayat_fee_agen(id) {
  ajax_default(
    {
      url: Urls("Riwayat_fee_agen/delete"),
      method: "post",
      loader: true,
      data: { id: id },
    },
    function (e, xhr) {
      smile_alert(e.error_msg);
      riwayat_fee_agen_start("riwayat_fee_agen", "Riwayat_fee_agen");
    },
    function (status, errMsg) {
      frown_alert(errMsg.msg);
    }
  );
}
