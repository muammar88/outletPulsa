class Model_list_operator {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_operator;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_operator => _list_operator;

  Model_list_operator.map(Map<String, dynamic> obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _list_operator = obj['list_operator'];
  }
}
