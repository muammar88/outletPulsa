import 'package:flutter/material.dart';
import 'package:outletpulsa/models/model_void.dart';
import '../data/rest_akun.dart';

class Update_akun_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;

  Future<void> updateNamaAkun(String nama) async {
    await Rest_akun().updateNamaAkun(nama).then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;

      notifyListeners();
    });
  }

  Future<void> updatePasswordAkun(String passwordLama, String passwordBaru,
      String konfirmasiPasswordBaru) async {
    await Rest_akun()
        .updatePasswordAkun(passwordLama, passwordBaru, konfirmasiPasswordBaru)
        .then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }
}
