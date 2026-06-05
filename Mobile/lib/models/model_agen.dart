class Model_agen {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Model_agen.map(Map<String, dynamic> obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _list = obj['list'];
  }
}
