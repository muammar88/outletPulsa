class Model_detail_transaksi {
  bool? _error;
  String? _errorMsg;
  String? _type;
  bool? _printStatus;
  String? _printTanggal;
  String? _printWaktu;
  String? _idPelanggan;
  String? _printNama;
  String? _printNominal;
  String? _printJmlKwh;
  String? _printToken;
  String? _printTarifDaya;
  String? _status;
  String? _productName;
  String? _dateTransaction;
  String? _nomorTujuan;
  String? _price;
  String? _serialNumber;
  String? _message;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get type => _type;
  bool? get printStatus => _printStatus;
  String? get printTanggal => _printTanggal;
  String? get printWaktu => _printWaktu;
  String? get idPelanggan => _idPelanggan;
  String? get printNama => _printNama;
  String? get printNominal => _printNominal;
  String? get printJmlKwh => _printJmlKwh;
  String? get printToken => _printToken;
  String? get printTarifDaya => _printTarifDaya;

  String? get status => _status;
  String? get productName => _productName;
  String? get dateTransaction => _dateTransaction;
  String? get nomorTujuan => _nomorTujuan;
  String? get price => _price;
  String? get serialNumber => _serialNumber;
  String? get message => _message;

  Model_detail_transaksi.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _status = obj['data']['status'];
    _type = obj['data']['type'];
    _printStatus = obj['data']['print_status'];

    _printTanggal = obj['data']['print_tanggal'];
    _printWaktu = obj['data']['print_waktu'];
    _idPelanggan = obj['data']['print_id_pelanggan'];
    _printNama = obj['data']['print_nama'];
    _printNominal = obj['data']['print_nominal'];
    _printJmlKwh = obj['data']['print_jml_kwh'];
    _printToken = obj['data']['print_token'];
    _printTarifDaya = obj['data']['print_tarif_daya'];

    _productName = obj['data']['productName'];
    _dateTransaction = obj['data']['dateTransaction'];
    _nomorTujuan = obj['data']['nomorTujuan'];
    _price = obj['data']['price'];
    _serialNumber = obj['data']['serialNumber'];
    _message = obj['data']['message'];
  }
}
