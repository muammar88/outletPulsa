class Model_transaction {
  bool? _error;
  String? _errorMsg;
  String? _kodeTransaksi;

  Model_transaction(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kodeTransaksi => _kodeTransaksi;

  Model_transaction.map(dynamic obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _kodeTransaksi = obj['kodeTransaksi'];
  }
}
