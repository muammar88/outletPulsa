class Model_prefix {
  bool? _error;
  String? _errorMsg;
  String? _operatorCode;
  String? _operatorName;
  List<Map<String, dynamic>>? _operatorsData;
  List<String>? _operators;

  Model_prefix(this._error, this._errorMsg, this._operatorCode, this._operatorName, this._operators, this._operatorsData);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get operatorCode => _operatorCode;
  String? get operatorName => _operatorName;
  List<String>? get operators => _operators;
  List<Map<String, dynamic>>? get operatorsData => _operatorsData;

  Model_prefix.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
      _errorMsg = obj['message'] ?? obj['error_msg'];
      if (obj['data'] != null && obj['data'] is Map) {
        _operatorCode = obj['data']['operator'];
        _operatorName = obj['data']['operatorName'];
        if (obj['data']['operators'] != null) {
          if (obj['data']['operators'] is List && obj['data']['operators'].isNotEmpty) {
            if (obj['data']['operators'][0] is Map) {
              _operatorsData = List<Map<String, dynamic>>.from(obj['data']['operators']);
              _operators = _operatorsData!.map((e) => e['kode'].toString()).toList();
            } else {
              _operators = List<String>.from(obj['data']['operators']);
            }
          } else {
            _operators = [];
            _operatorsData = [];
          }
        }
      }
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
      _errorMsg = obj['message'] ?? obj['error_msg'];
    }
  }
}
