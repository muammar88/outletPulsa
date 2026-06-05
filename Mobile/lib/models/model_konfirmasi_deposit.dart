class Model_konfirmasi_deposit {
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

  Model_konfirmasi_deposit(this._error, this._errorMsg);

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

  Model_konfirmasi_deposit.map(dynamic obj) {
    _error = obj['error'];
    _errorMsg = obj['error_msg'];
    _kode = obj['list']['kode'];
    _nominal = obj['list']['nominal'];
    _bank_tujuan_transfer = obj['list']['bank_tujuan_transfer'];
    _nomor_rekening_akun = obj['list']['nomor_rekening_akun'];
    _nama_akun = obj['list']['nama_akun'];
    _status_deposit = obj['list']['status_deposit'];
    _status_kirim = obj['list']['status_kirim'];
    _alasan_penolakan = obj['list']['alasan_penolakan'];
    _waktu_kirim = obj['list']['waktu_kirim'];
  }
}
