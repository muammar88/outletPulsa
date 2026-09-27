import 'package:flutter/material.dart';
import 'package:outletpulsa/services/deposit.dart';
import 'package:outletpulsa/models/model_detail_deposit.dart';
import 'package:outletpulsa/models/model_void.dart';

class Deposit_provider with ChangeNotifier {
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

  Future<Model_void> depositSaldo(
      String nominal, String bank_tujuan_transfer) async {
    return await Rest_deposit()
        .depositSaldo(nominal, bank_tujuan_transfer)
        .then((Model_void e) async {
      if (e.error == true) {
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }

  Future<Model_void> getLinkquPaymentMethods() async {
    return await Rest_deposit().getLinkquPaymentMethods();
  }

  Future<Model_void> processLinkquDeposit({
    required int nominal,
    required String paymentMethod,
    String? bankCode,
    String? idempotencyKey,
  }) async {
    return await Rest_deposit().processLinkquDeposit(
      nominal,
      paymentMethod,
      bankCode,
      idempotencyKey: idempotencyKey,
    );
  }

  Future<Model_void> getPaymentGatewayDetail(String transactionId) async {
    return await Rest_deposit().getPaymentGatewayDetail(transactionId);
  }

  Future<void> getDetailDeposit(String id) async {
    return await Rest_deposit()
        .getDetailDeposit(id)
        .then((Model_detail_deposit e) async {
      if (e.error == false) {
        print("-----xxxx-----");
        print(e.kode);
        print("-----xxxx-----");
        _kode = e.kode;
        _nominal = e.nominal;
        _bank_tujuan_transfer = e.bank_tujuan_transfer;
        _nomor_rekening_akun = e.nomor_rekening_akun;
        _nama_akun = e.nama_akun;
        _status_deposit = e.status_deposit;
        _status_kirim = e.status_kirim;
        _alasan_penolakan = e.alasan_penolakan;
        _waktu_kirim = e.waktu_kirim;
        _payment_gateway = e.payment_gateway;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
