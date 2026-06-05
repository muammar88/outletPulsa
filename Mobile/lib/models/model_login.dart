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
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _token = obj['token'];
    _kode = obj['kode'];
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
