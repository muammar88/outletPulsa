import 'package:flutter/material.dart';
import '../data/rest_info.dart';
import '../models/model_list.dart';

class Info_belum_baca_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getInfoBelumBaca() async {
    await Rest_info().getInfoBelumBaca().then((Model_list e) async {
      if (e.error == false) {
        _list = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
