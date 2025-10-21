function daftar_transaksi_hari_ini_index(path, url) {
  var tb = tables({
    width: [10, 25, 25, 25, 10, 5],
    columns: [
      { title: "KODE", center: true },
      { title: "INFO PRODUK", center: true },
      { title: "INFO MEMBER", center: true },
      { title: "INFO TRANSAKSI", center: true },
      { title: "DateTimes", center: true },
      { title: "Aksi", center: true },
    ],
    tools:
      search_btn({
        placeholder: "KODE TRANSAKSI",
        width: 250,
        onclick: `onClick="${path}_start('${path}', '${url}')"`,
        path: path,
      }) +
      selectFN({
        name_id: "status_transaksi",
        option: [
          { id: "semua", value: "Semua Status" },
          { id: "sukses", value: "Sukses" },
          { id: "proses", value: "Proses" },
          { id: "gagal", value: "Gagal" },
        ],
        class: "float-right mt-1 mr-2",
        att: `style="display: inline-block;width: 120px;"`,
      }),
    path: path,
    not_found_label: "Daftar Transaksi Hari Ini Tidak Ditemukan",
  });

  return tb;
}

function daftar_transaksi_hari_ini_start(path, url) {
  daftar_transaksi_hari_ini_(100, path, url);
}

function daftar_transaksi_hari_ini_(perpage, path, url, input) {
  var param = [];
  param["search"] = $("#search_" + path).val();
  if (input != undefined) {
    param["pageNumber"] = input;
  }
  param["status_transaksi"] = $("#status_transaksi").val();

  get_data(perpage, {
    url: Urls(url + "/server_side"),
    pagination_id: "pagination_" + path,
    bodyTable_id: "body_" + path,
    fn: "List_" + path,
    warning_text:
      '<td colspan="8"><center>Daftar Transaksi Tidak Ditemukan</center></td>',
    param: param,
  });
}

function List_daftar_transaksi_hari_ini(JSONData) {
  const json = JSON.parse(JSONData);
  var btn = [];

  var obj_info_produk = [
    {
      title: "KODE PRODUK",
      value: "<b>#" + json.produk_info.kode + "</b>",
    },
    { title: "NAMA PRODUK", value: json.produk_info.name },
    {
      title: "TIPE PRODUK",
      value:
        json.produk_info.tipe == "pascabayar"
          ? `<b>PASCABAYAR</b>`
          : "<b>PRABAYAR</b>",
    },
  ];

  var obj_info_member = [
    {
      title: "KODE MEMBER",
      value: "<b>#" + json.member_info.kode + "</b>",
    },
    {
      title: "NAMA MEMBER",
      value: json.member_info.name,
    },
    {
      title: "NOMOR WHATSAPP",
      value: json.member_info.whatsapp_number,
    },
  ];
  var status = "";
  var obj_info_transaksi = [];
  if (Object.keys(json.transaction_prabayar).length > 0) {
    var proses = proses_transaksi_prabayar(json);

    obj_info_transaksi = proses.obj_info_transaksi;
    status = proses.status;
    btn = proses.btn;
  } else if (Object.keys(json.transaction_pascabayar).length > 0) {
    var proses = proses_transaksi_pascabayar(json);
    obj_info_transaksi = proses.obj_info_transaksi;
    status = proses.status;
    btn = proses.btn;
  }

  var info_produk = simpleTableFunc(obj_info_produk, "40");
  var info_member = simpleTableFunc(obj_info_member, "40");
  var info_transaksi = simpleTableFunc(obj_info_transaksi, "50");

  var html = tr([
    td_center([`<b>#` + json.kode + `</b>`]),
    td_center([info_produk]),
    td_center([info_member]),
    td_center([info_transaksi]),
    td_center([json.updatedAt]),
    td_center(btn, 'style="text-align:right;"'),
  ]);
  return html;
}
