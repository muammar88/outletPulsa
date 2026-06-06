class Model_get_prefix {
  bool? _error;
  String? _errorMsg;
  String? _kode;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;

  Model_get_prefix.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _kode = data['kode'];
  }
}
