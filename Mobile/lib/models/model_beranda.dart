class Model_beranda {
  bool? _error;
  String? _errorMsg;
  String? _kode;
  String? _name;
  String? _nomor_whatsapp;
  String? _saldo;
  bool? _status_deposit;

  Model_beranda(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;
  String? get name => _name;
  String? get nomor_whatsapp => _nomor_whatsapp;
  String? get saldo => _saldo;
  bool? get status_deposit => _status_deposit;

  Model_beranda.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];

    var data = obj['data'] ?? obj;
    _kode = data['kode'];
    _name = data['name'];
    _nomor_whatsapp = data['nomor_whatsapp'];
    _saldo = data['saldo'];
    _status_deposit = data['status_deposit'];
  }
}
