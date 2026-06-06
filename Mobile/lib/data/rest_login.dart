import '../config/config.dart';
import '../helper/database_helper.dart';
import '../models/model_login.dart';
import '../models/model_void.dart';
import '../utils/network_util.dart';
import 'dart:convert';

class Rest_login {
  String? _login_url;
  String? _check_login_url;

  // constructor
  Rest_login() {
    final config = ConfigApp();
    _login_url = config.login_url;
    _check_login_url = config.check_login_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  var db = new DatabaseHelper();

  Future<Model_login> RestSubmitLogin(String whatsapp_number, String password) {
    Uri url = Uri.parse(_login_url!);
    return _netUtil.post_login(url, {
      "whatsapp_number": whatsapp_number,
      "password": password,
    }).then((dynamic res) async {
      return new Model_login.map(res);
    });
  }

  Future<Model_void> RestCekLogin(String token) {
    Uri url = Uri.parse(_check_login_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    return _netUtil.post(url, headers, jsonEncode({
      "token": token,
    })).then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
