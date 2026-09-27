class Model_status_pascabayar {
  bool? _error;
  String? _errorMsg;
  String? _message;
  String? _refId;
  String? _status;
  String? _providerStatus;
  String? _serialNumber;
  String? _total;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get message => _message;
  String? get refId => _refId;
  String? get status => _status;
  String? get providerStatus => _providerStatus;
  String? get serialNumber => _serialNumber;
  String? get total => _total;

  Model_status_pascabayar.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['error_msg'] ?? obj['message'];
    _message = obj['message'] ?? obj['error_msg'];
    final data = obj['data'] is Map ? obj['data'] : obj;
    _refId = data['ref_id']?.toString();
    _status = data['status']?.toString();
    _providerStatus = data['provider_status']?.toString();
    _serialNumber = data['serial_number']?.toString();
    _total = data['total']?.toString();
  }
}
