import 'package:flutter/material.dart';
import '../services/info.dart';
import '../models/model_list.dart';

class Info_sudah_baca_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list => _list;

  Future<void> getInfoSudahBaca() async {
    Future.microtask(() {
      _list = null;
      _error = null;
      _errorMsg = null;
      notifyListeners();
    });

    try {
      await Rest_info().getInfoSudahBaca().then((Model_list e) async {
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
