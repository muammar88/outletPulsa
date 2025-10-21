function beranda_utama_index(path, url) {
  function card_beranda(i) {
    return `<div class="col-${i.col}">
               <div class="info-box mb-3 ${i.type}" style="background-color: #1e364e !important;">
                  <span class="info-box-icon" onClick="get_${i.id}()"><i class="${i.icon}"></i></span>
                  <div class="info-box-content">
                     <span class="info-box-text" style="font-weight: bold;font-size: 17px;">${i.label}</span>
                     <span class="info-box-number mt-0" id="${i.id}" style="font-size: 15px;">${i.default}</span>
                  </div>
               </div>
            </div>`;
  }

  function card_small(i) {
    return `<div class="col-${i.col}">
               <div class="info-box mb-3">
               <span class="info-box-icon ${i.type} elevation-1" onClick="get_${i.id}()" style="background-color: #1e364e !important;"><i class="${i.icon}"></i></span>
               <div class="info-box-content">
                  <span class="info-box-text" style="font-weight: bold;font-size: 17px;">${i.label}</span>
                  <span class="info-box-number" id="${i.id}">${i.default}</span>
               </div>
               </div>
            </div>`;
  }

  var html = card_beranda({
    col: 4,
    label: "Saldo IAK",
    id: "saldo_iak",
    icon: "fas fa-info-circle",
    type: "bg-success",
    default: "Rp 0,-",
  });
  html += card_beranda({
    col: 4,
    label: "Saldo Tripay",
    id: "saldo_tripay",
    icon: "fas fa-info-circle",
    type: "bg-success",
    default: "Rp 0,-",
  });
  html += card_beranda({
    col: 4,
    label: "Saldo Digiflaz",
    id: "saldo_digiflaz",
    icon: "fas fa-info-circle",
    type: "bg-success",
    default: "Rp 0,-",
  });
  html += card_small({
    col: 3,
    label: "Transaksi Hari Ini",
    id: "transaksi_hari_ini",
    icon: "fas fa-compress-arrows-alt",
    type: "bg-info",
    default: "0 Transaksi",
  });
  html += card_small({
    col: 3,
    label: "Member Baru Hari Ini",
    id: "member_baru_hari_ini",
    icon: "fas fa-user",
    type: "bg-info",
    default: "0 Orang",
  });
  html += card_small({
    col: 3,
    label: "Total Member",
    id: "total_member",
    icon: "fas fa-users",
    type: "bg-info",
    default: "0 Orang",
  });
  html += card_small({
    col: 3,
    label: "Sisa Saldo Member",
    id: "total_saldo_member",
    icon: "fas fa-money-bill-alt",
    type: "bg-success",
    default: "Rp 0,-",
  });

  return html;
}

function beranda_utama_start(path, url) {
  get_saldo_iak();
  get_saldo_tripay();
  get_saldo_digiflaz();
  get_transaksi_hari_ini();
  get_member_baru_hari_ini();
  total_member();
  total_saldo_member();
}

function get_saldo_iak() {
  ajax_default(
    {
      url: Urls("Beranda_utama/get_saldo_iak"),
      method: "get",
    },
    function (e, xhr) {
      $("#saldo_iak").html("Rp " + numberFormat(e.data));
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function get_saldo_tripay() {
  ajax_default(
    {
      url: Urls("Beranda_utama/get_saldo_tripay"),
      method: "get",
    },
    function (e, xhr) {
      $("#saldo_tripay").html("Rp " + numberFormat(e.data));
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function get_saldo_digiflaz() {
  ajax_default(
    {
      url: Urls("Beranda_utama/get_saldo_digiflaz"),
      method: "get",
    },
    function (e, xhr) {
      $("#saldo_digiflaz").html("Rp " + numberFormat(e.data));
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

//

function get_transaksi_hari_ini() {
  ajax_default(
    {
      url: Urls("Beranda_utama/get_transaksi_hari_ini"),
      method: "get",
    },
    function (e, xhr) {
      $("#transaksi_hari_ini").html(e.data + " Transaksi");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function get_member_baru_hari_ini() {
  ajax_default(
    {
      url: Urls("Beranda_utama/get_member_baru_hari_ini"),
      method: "get",
    },
    function (e, xhr) {
      $("#member_baru_hari_ini").html(e.data + " Member");
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function total_member() {
  ajax_default(
    {
      url: Urls("Beranda_utama/total_member"),
      method: "get",
    },
    function (e, xhr) {
      $("#total_member").html(e.data.total + " Member");
      $("#total_saldo_member").html(
        "Rp " + numberFormat(e.data.total_saldo) + ",-"
      );
    },
    function (status, errMsg) {
      frown_alert(errMsg.error_msg);
    }
  );
}

function total_saldo_member() {}
