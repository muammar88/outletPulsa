class Model_list_produk {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_produk;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_produk => _list_produk;

  Model_list_produk.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      // Error eksplisit dari server (flag error = true)
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      // Data null/kosong bukan berarti error — tampilkan empty state
      _error = false;
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;

    // Server may use 'list_produk' or 'list' as the key
    var rawList = data['list_produk'] ?? data['list'];

    if (rawList == null || (rawList is Map && rawList.isEmpty) || (rawList is List && rawList.isEmpty)) {
      // Empty map (not null) so UI shows "not found" instead of infinite skeleton
      _list_produk = {};
    } else if (rawList is List) {
      // Convert List to indexed Map
      Map<String, dynamic> converted = {};
      for (int i = 0; i < rawList.length; i++) {
        converted[i.toString()] = rawList[i];
      }
      _list_produk = converted;
    } else if (rawList is Map) {
      _list_produk = Map<String, dynamic>.from(rawList);
    } else {
      _list_produk = {};
    }
  }
}
