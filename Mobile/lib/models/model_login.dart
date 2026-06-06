class Model_login {
  bool? _error;
  String? _errorMsg;
  String? _token;
  String? _kode;

  Model_login(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get token => _token;
  String? get kode => _kode;

  Model_login.map(dynamic obj) {
    // Karena TransformInterceptor backend mengubah obj['error'] menjadi null,
    // kita asumsikan error = true jika obj['data'] bernilai null.
    _error = obj['data'] == null;
    _errorMsg = obj['message'] ?? obj['error_msg'];
    
    if (obj['data'] != null) {
      _token = obj['data']['token'];
      _kode = obj['data']['kode'];
    } else {
      _token = null;
      _kode = null;
    }
  }

  Map<String, dynamic> mapDb(dynamic obj) {
    var map = new Map<String, dynamic>();
    map["token"] = this._token;
    map["kode"] = this._kode;
    return map;
  }

  Map<String, dynamic> toMap() {
    var map = new Map<String, dynamic>();
    map["token"] = this._token;
    map["kode"] = this._kode;
    return map;
  }
}
