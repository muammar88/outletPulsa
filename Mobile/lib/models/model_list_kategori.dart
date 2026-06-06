class Model_list_kategori {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_kategori;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_kategori => _list_kategori;

  Model_list_kategori.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _list_kategori = data['list_kategori'];
  }
}
