class Model_transaksi_pascabayar {
  bool? _error;
  String? _errorMsg;
  String? _kode;
  // String? _name;
  // String? _nomor_whatsapp;
  // String? _saldo;
  // bool? _status_deposit;

  Model_transaksi_pascabayar(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;
  // String? get name => _name;
  // String? get nomor_whatsapp => _nomor_whatsapp;
  // String? get saldo => _saldo;
  // bool? get status_deposit => _status_deposit;

  Model_transaksi_pascabayar.map(dynamic obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _kode = obj['kode_transaksi'];
    // _name = obj['name'];
    // _nomor_whatsapp = obj['nomor_whatsapp'];
    // _saldo = obj['saldo'];
    // _status_deposit = obj['status_deposit'];
  }
}
