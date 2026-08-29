class Model_void {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _data;

  Model_void(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get data => _data;

  Model_void.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
      _errorMsg = obj['message'] ?? obj['error_msg'];
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty && obj['data']['success'] != true);
      _errorMsg = obj['message'] ?? obj['error_msg'];
      if (obj['data'] is Map) {
        _data = obj['data'];
      }
    }
  }
}
