import 'package:flutter/material.dart';
import 'package:outletpulsa/services/riwayat.dart';
import 'package:outletpulsa/models/model_list.dart';

class Riwayat_prabayar_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;
  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getRiwayatPrabayar({String search = ""}) async {
    await Rest_riwayat().getRiwayatPrabayar(search: search).then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
