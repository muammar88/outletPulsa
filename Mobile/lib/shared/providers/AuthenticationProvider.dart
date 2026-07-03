import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:outletpulsa/services/login.dart';
import 'package:outletpulsa/models/model_login.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/storage/ModelSQL.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/socket/socket_service.dart';
import 'package:outletpulsa/core/constants/config.dart';
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

  Future<void> logOut() async {
    final db = SQLHelper();
    await db.deleteDataProfil('1');
    _isLogin = false;
    SocketService().disconnect();
    notifyListeners();
  }

  Future<Model_void> submit_login(
      String nomor_whatsapp, String password) async {
    final db = SQLHelper();
    String? deviceCode = await db.getDeviceCode();
    if (deviceCode == null) {
      return new Model_void.map({'error': true, 'error_msg': 'Perangkat tidak terdaftar. Silakan restart aplikasi.'});
    }

    return await Rest_login()
        .RestSubmitLogin(nomor_whatsapp, password, deviceCode)
        .then((Model_login e) async {
      // filter error
      if (e.error == true) {
        _isLogin = false;
        // menghapus data di database jika error pada proses login
        await db.deleteDataProfil('1');
        notifyListeners();
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        // menyimpan data login ke dalam database (tanpa password)
        var dataProfil = ModelSQL(
            id: '1', kode: e.kode!, username: nomor_whatsapp, token: e.token!);
        await db.insertDataProfil(dataProfil);
        _isLogin = true;
        SocketService().connect(ConfigApp().socket_url!, e.token!);
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
            SocketService().connect(ConfigApp().socket_url!, dataProfils!['token']);
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
