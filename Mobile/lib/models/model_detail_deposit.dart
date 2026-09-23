class Model_detail_deposit {
  bool? _error;
  String? _errorMsg;
  String? _kode;
  String? _nominal;
  String? _bank_tujuan_transfer;
  String? _nomor_rekening_akun;
  String? _nama_akun;
  String? _status_deposit;
  String? _status_kirim;
  String? _alasan_penolakan;
  String? _waktu_kirim;
  Map<String, dynamic>? _payment_gateway;

  Model_detail_deposit(this._error, this._errorMsg);

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get kode => _kode;
  String? get nominal => _nominal;
  String? get bank_tujuan_transfer => _bank_tujuan_transfer;
  String? get nomor_rekening_akun => _nomor_rekening_akun;
  String? get nama_akun => _nama_akun;
  String? get status_deposit => _status_deposit;
  String? get status_kirim => _status_kirim;
  String? get alasan_penolakan => _alasan_penolakan;
  String? get waktu_kirim => _waktu_kirim;
  Map<String, dynamic>? get payment_gateway => _payment_gateway;

  Model_detail_deposit.map(dynamic obj) {
    if (obj['error'] != null && obj['error'] != '') {
      _error = obj['error'] == true || obj['error'] == 'true';
    } else {
      _error = obj['data'] == null || (obj['data'] is Map && obj['data'].isEmpty);
    }
    _errorMsg = obj['message'] ?? obj['error_msg'];
    var data = obj['data'] ?? obj;
    if (data['list'] != null) {
      _kode = data['list']['kode'];
      _nominal = data['list']['nominal'];
      _bank_tujuan_transfer = data['list']['bank_tujuan_transfer'];
      _nomor_rekening_akun = data['list']['nomor_rekening_akun'];
      _nama_akun = data['list']['nama_akun'];
      _status_deposit = data['list']['status_deposit'];
      _status_kirim = data['list']['status_kirim'];
      _alasan_penolakan = data['list']['alasan_penolakan'];
      _waktu_kirim = data['list']['waktu_kirim'];
      if (data['list']['payment_gateway'] != null && data['list']['payment_gateway'] is Map) {
        _payment_gateway = Map<String, dynamic>.from(data['list']['payment_gateway']);
      }
    }
  }
}
