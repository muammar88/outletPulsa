class Model_info_deposit {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_tiket;
  Map<String, dynamic>? _list_bank;
  Map<String, dynamic>? _list_select_bank;
  String? _pesan;

  Model_info_deposit(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;

  Map<String, dynamic>? get list_tiket => _list_tiket;
  Map<String, dynamic>? get list_bank => _list_bank;
  Map<String, dynamic>? get list_select_bank => _list_select_bank;
  String? get pesan => _pesan;

  Model_info_deposit.map(Map<String, dynamic> obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    _list_tiket = data['list_tiket'];
    _list_bank = data['list_bank']!;
    _list_select_bank = data['list_select_bank']!;
    _pesan = data['pesan'];
  }
}

class Tiket {
  final String? id;
  final String? kode;
  final String? total;
  final String? waktuRequest;

  Tiket({
    this.id,
    this.kode,
    this.total,
    this.waktuRequest,
  });

  factory Tiket.fromJson(Map<String, dynamic> parsedJson) {
    return Tiket(
        id: parsedJson['id'].toString(),
        kode: parsedJson['kode'].toString(),
        total: parsedJson['total'].toString(),
        waktuRequest: parsedJson['waktuRequest'].toString());
  }
}
