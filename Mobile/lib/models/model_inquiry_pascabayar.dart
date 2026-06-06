class Model_inquiry_pascabayar {
  bool? _error;
  String? _errorMsg;
  String? _refId;
  String? _trId;
  String? _kodeProduct;
  String? _nomorTujuan;
  String? _namaPelanggan;
  String? _nominal;
  String? _totalTagihan;
  String? _biayaAdmin;
  String? _fee;

  Model_inquiry_pascabayar(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get refId => _refId;
  String? get trId => _trId;
  String? get kodeProduct => _kodeProduct;
  String? get nomorTujuan => _nomorTujuan;
  String? get namaPelanggan => _namaPelanggan;
  String? get nominal => _nominal;
  String? get totalTagihan => _totalTagihan;
  String? get biayaAdmin => _biayaAdmin;
  String? get fee => _fee;

  Model_inquiry_pascabayar.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _refId = obj['data']['ref_id'];
    _trId = obj['data']['tr_id'];
    _kodeProduct = obj['data']['kode_product'];
    _nomorTujuan = obj['data']['nomor_tujuan'];
    _namaPelanggan = obj['data']['nama_pelanggan'];
    _nominal = obj['data']['nominal'];
    _totalTagihan = obj['data']['totalTagihan'];
    _biayaAdmin = obj['data']['biaya_admin'];
    _fee = obj['data']['fee'];
  }
}
