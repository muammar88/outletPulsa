class Model_detail_transaksi_pascabayar {
  bool? _error;
  String? _errorMsg;
  String? _kode;
  String? _status;
  String? _productName;
  bool? _printStatus;
  String? _tanggal;
  String? _waktu;
  String? _noref;
  String? _tarif;
  String? _daya;
  String? _total;
  String? _dateTransaction;
  String? _nomorTujuan;
  String? _namaPelanggan;
  String? _price;
  String? _totalPrice;
  String? _biayaAdmin;
  String? _fee;
  String? _message;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;
  String? get status => _status;
  bool? get printStatus => _printStatus;
  String? get tanggal => _tanggal;
  String? get waktu => _waktu;
  String? get noref => _noref;
  String? get tarif => _tarif;
  String? get daya => _daya;
  String? get total => _total;
  String? get productName => _productName;
  String? get dateTransaction => _dateTransaction;
  String? get nomorTujuan => _nomorTujuan;
  String? get namaPelanggan => _namaPelanggan;
  String? get price => _price;
  String? get totalPrice => _totalPrice;
  String? get biayaAdmin => _biayaAdmin;
  String? get fee => _fee;
  String? get message => _message;

  Model_detail_transaksi_pascabayar.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _kode = obj['data']['kode'];
    _status = obj['data']['status'];
    _printStatus = obj['data']['print_status'];
    _tanggal = obj['data']['tanggal'];
    _waktu = obj['data']['waktu'];
    _noref = obj['data']['noref'];
    _tarif = obj['data']['tarif'];
    _daya = obj['data']['daya'];
    _total = obj['data']['total'];
    _productName = obj['data']['productName'];
    _dateTransaction = obj['data']['dateTransaction'];
    _nomorTujuan = obj['data']['nomorTujuan'];
    _namaPelanggan = obj['data']['namaPelanggan'];
    _price = obj['data']['price'];
    _totalPrice = obj['data']['totalPrice'];
    _biayaAdmin = obj['data']['biayaAdmin'];
    _fee = obj['data']['fee'];
    _message = obj['data']['message'];
  }
}
