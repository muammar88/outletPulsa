class Model_list_produk {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_produk;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_produk => _list_produk;

  Model_list_produk.map(Map<String, dynamic> obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _list_produk = obj['list_produk'];
  }
}
