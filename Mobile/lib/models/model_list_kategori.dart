class Model_list_kategori {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_kategori;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_kategori => _list_kategori;

  Model_list_kategori.map(Map<String, dynamic> obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _list_kategori = obj['list_kategori'];
  }
}
