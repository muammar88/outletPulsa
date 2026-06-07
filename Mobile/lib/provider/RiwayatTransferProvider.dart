import 'package:flutter/material.dart';
import '../services/riwayat.dart';
import '../models/model_list.dart';

class Riwayat_transfer_saldo_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;
  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getRiwayatTransferSaldo() async {
    await Rest_riwayat().getRiwayatTransferSaldo().then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
