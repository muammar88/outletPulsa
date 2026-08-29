import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/core/helper/database_helper.dart';
import 'package:outletpulsa/models/model_login.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
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

  Future<Model_login> RestSubmitLogin(String whatsapp_number, String password, String device_code) {
    Uri url = Uri.parse(_login_url!);
    return _netUtil.post_login(url, {
      "whatsapp_number": whatsapp_number,
      "password": password,
      "device_code": device_code,
    }).then((dynamic res) async {
      print('response: $res');
      return new Model_login.map(res);
    });
  }

  Future<Model_void> RestCekLogin(String token) {
    Uri url = Uri.parse(_check_login_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "token": token,
            }))
        .then((dynamic res) async {
      print('response: $res');
      return new Model_void.map(res);
    });
  }
}
