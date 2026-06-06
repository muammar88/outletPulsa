class Model_list_operator {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_operator;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_operator => _list_operator;

  Model_list_operator.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _list_operator = data['list_operator'];
  }
}
