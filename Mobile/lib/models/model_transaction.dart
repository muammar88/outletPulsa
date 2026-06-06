class Model_transaction {
  bool? _error;
  String? _errorMsg;
  String? _kodeTransaksi;

  Model_transaction(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kodeTransaksi => _kodeTransaksi;

  Model_transaction.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _kodeTransaksi = data['kodeTransaksi'];
  }
}
