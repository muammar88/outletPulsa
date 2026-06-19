class Model_prefix {
  bool? _error;
  String? _errorMsg;
  String? _operatorCode;

  Model_prefix(this._error, this._errorMsg, this._operatorCode);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get operatorCode => _operatorCode;

  Model_prefix.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
      _errorMsg = obj['message'] ?? obj['error_msg'];
      if (obj['data'] != null && obj['data'] is Map) {
        _operatorCode = obj['data']['operator'];
      }
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
      _errorMsg = obj['message'] ?? obj['error_msg'];
    }
  }
}
