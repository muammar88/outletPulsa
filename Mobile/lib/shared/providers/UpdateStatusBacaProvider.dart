import 'package:flutter/material.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/services/info.dart';

class Update_status_baca_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;

  Future<void> updateStatusBaca(id) async {
    await Rest_info().updateStatusBaca(id).then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
