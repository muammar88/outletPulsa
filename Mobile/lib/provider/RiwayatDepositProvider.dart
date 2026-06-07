import 'package:flutter/material.dart';
import '../services/riwayat.dart';
import '../models/model_list.dart';

class Riwayat_deposit_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getRiwayatDeposit() async {
    await Rest_riwayat().getRiwayatDeposit().then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
