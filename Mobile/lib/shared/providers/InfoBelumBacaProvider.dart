import 'package:flutter/material.dart';
import 'package:outletpulsa/services/info.dart';
import 'package:outletpulsa/models/model_list.dart';

class Info_belum_baca_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getInfoBelumBaca() async {
    Future.microtask(() {
      _list = null;
      _error = null;
      _errorMsg = null;
      notifyListeners();
    });

    try {
      await Rest_info().getInfoBelumBaca().then((Model_list e) async {
        if (e.error == false) {
          _list = e.list ?? {};
        } else {
          _list = {};
        }
        _error = e.error;
        _errorMsg = e.errorMsg;
        notifyListeners();
      });
    } catch (e) {
      _error = true;
      _errorMsg = e.toString();
      _list = {};
      notifyListeners();
    }
  }
}
