class Model_void {
  bool? _error;
  String? _errorMsg;

  Model_void(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;

  Model_void.map(dynamic obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
  }
}
