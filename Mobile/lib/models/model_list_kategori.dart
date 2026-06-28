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
      // Data null/kosong bukan berarti error — tampilkan empty state
      _error = false;
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;

    // Server may use 'list_kategori' or 'list' as the key
    var rawList = data['list_kategori'] ?? data['list'];

    if (rawList == null || (rawList is Map && rawList.isEmpty) || (rawList is List && rawList.isEmpty)) {
      // Empty map (not null) so UI shows "not found" instead of infinite skeleton
      _list_kategori = {};
    } else if (rawList is List) {
      // Convert List to indexed Map
      Map<String, dynamic> converted = {};
      for (int i = 0; i < rawList.length; i++) {
        converted[i.toString()] = rawList[i];
      }
      _list_kategori = converted;
    } else if (rawList is Map) {
      _list_kategori = Map<String, dynamic>.from(rawList);
    } else {
      _list_kategori = {};
    }
  }
}
