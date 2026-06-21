import 'package:flutter/material.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/services/akun.dart';

class Transfer_saldo_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;

  Future<void> transferSaldo(String nomor_tujuan, String nominal) async {
    await Rest_akun()
        .transferSaldo(nomor_tujuan, nominal)
        .then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;

      notifyListeners();
    });
  }
}
