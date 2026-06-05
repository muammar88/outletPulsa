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
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _list_tiket = obj['list_tiket'];
    _list_bank = obj['list_bank']!;
    _list_select_bank = obj['list_select_bank']!;
    _pesan = obj['pesan'];
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
