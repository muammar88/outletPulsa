import 'package:flutter/material.dart';
import 'package:outletpulsa/services/riwayat.dart';
import 'package:outletpulsa/models/model_list.dart';

class Riwayat_deposit_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getRiwayatDeposit({String search = ""}) async {
    await Rest_riwayat().getRiwayatDeposit(search: search).then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
