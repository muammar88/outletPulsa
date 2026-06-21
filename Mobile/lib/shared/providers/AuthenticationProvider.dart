import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:outletpulsa/services/login.dart';
import 'package:outletpulsa/models/model_login.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/storage/ModelSQL.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';

class Authentication_provider with ChangeNotifier {
  bool _isLogin = false;
  bool get isLogin => _isLogin;

  set isLogin(bool value) {
    _isLogin = value;
    notifyListeners();
  }

  void isLoginFalse() {
    _isLogin = false;
    notifyListeners();
  }

  void logOut() async {
    final db = SQLHelper();
    await db.deleteDataProfil('1');
    _isLogin = false;
    notifyListeners();
  }

  Future<Model_void> submit_login(
      String nomor_whatsapp, String password) async {
    return await Rest_login()
        .RestSubmitLogin(nomor_whatsapp, password)
        .then((Model_login e) async {
      final db = SQLHelper();
      // filter error
      if (e.error == true) {
        _isLogin = false;
        // menghapus data di database jika error pada proses login
        db.deleteDataProfil('1');
        notifyListeners();
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        // menyimpan data login ke dalam database (tanpa password)
        var dataProfil = ModelSQL(
            id: '1', kode: e.kode!, username: nomor_whatsapp, token: e.token!);
        db.insertDataProfil(dataProfil);
        _isLogin = true;
        notifyListeners();
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }

  Future<void> check_login() async {
    final db = SQLHelper();
    // mengambil data profil yang ada di database
    bool isExist = await db.isDataExist('1');
    if (isExist) {
      Map<String, dynamic>? dataProfils = await db.getSingleData('1');
      try {
        await Rest_login()
            .RestCekLogin(dataProfils!['token'])
            .then((Model_void e) async {
          if (e.error == true) {
            _isLogin = false;
            notifyListeners();
          } else {
            _isLogin = true;
            notifyListeners();
          }
        });
      } catch (e) {
        _isLogin = false;
        notifyListeners();
      }
    } else {
      _isLogin = false;
      notifyListeners();
    }
  }
}
