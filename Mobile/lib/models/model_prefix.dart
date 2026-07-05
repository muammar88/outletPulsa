class Model_prefix {
  bool? _error;
  String? _errorMsg;
  String? _operatorCode;
  List<String>? _operators;

  Model_prefix(this._error, this._errorMsg, this._operatorCode, this._operators);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get operatorCode => _operatorCode;
  List<String>? get operators => _operators;

  Model_prefix.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
      _errorMsg = obj['message'] ?? obj['error_msg'];
      if (obj['data'] != null && obj['data'] is Map) {
        _operatorCode = obj['data']['operator'];
        if (obj['data']['operators'] != null) {
          _operators = List<String>.from(obj['data']['operators']);
        }
      }
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
      _errorMsg = obj['message'] ?? obj['error_msg'];
    }
  }
}
