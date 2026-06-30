import 'package:flutter/material.dart';
import 'package:outletpulsa/services/riwayat.dart';
import 'package:outletpulsa/models/model_list.dart';

class Riwayat_transfer_saldo_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;
  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;
  
  set list(Map<String, dynamic>? value) {
    _list = value;
    notifyListeners();
  }

  Future<void> getRiwayatTransferSaldo({String search = ""}) async {
    await Rest_riwayat().getRiwayatTransferSaldo(search: search).then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
