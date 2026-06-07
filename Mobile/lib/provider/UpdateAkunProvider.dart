import 'package:flutter/material.dart';
import 'package:outletpulsa/models/model_void.dart';
import '../services/akun.dart';

class Update_akun_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  bool _isLoading = false;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  bool get isLoading => _isLoading;

  Future<void> updateNamaAkun(String nama) async {
    _isLoading = true;
    notifyListeners();

    await Rest_akun().updateNamaAkun(nama).then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      _isLoading = false;

      notifyListeners();
    }).catchError((e) {
      _error = true;
      _errorMsg = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;

      notifyListeners();
    });
  }

  Future<void> updatePasswordAkun(String passwordLama, String passwordBaru,
      String konfirmasiPasswordBaru) async {
    _isLoading = true;
    notifyListeners();
    
    await Rest_akun()
        .updatePasswordAkun(passwordLama, passwordBaru, konfirmasiPasswordBaru)
        .then((Model_void e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      _isLoading = false;
      notifyListeners();
    }).catchError((e) {
      _error = true;
      _errorMsg = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
    });
  }
}
