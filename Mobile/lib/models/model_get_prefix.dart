class Model_get_prefix {
  bool? _error;
  String? _errorMsg;
  String? _kode;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;

  Model_get_prefix.map(dynamic obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _kode = obj['kode'];
  }
}
