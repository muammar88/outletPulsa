class Model_list_operator {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_operator;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_operator => _list_operator;

  Model_list_operator.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;

    // Server returns 'list' key (not 'list_operator')
    // Also handles empty object {} from server when no data found
    var rawList = data['list'] ?? data['list_operator'];
    if (rawList == null || (rawList is Map && rawList.isEmpty) || (rawList is List && rawList.isEmpty)) {
      // Set to empty map (not null) so UI shows "not found" instead of infinite skeleton
      _list_operator = {};
    } else if (rawList is Map) {
      _list_operator = Map<String, dynamic>.from(rawList);
    } else {
      _list_operator = {};
    }
  }
}
