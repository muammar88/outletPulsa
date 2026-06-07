import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/utils/network_util.dart';

class Rest_registrasi {
  String? _get_otp_url;
  String? _get_otp_reset_password_url;
  String? _register_url;
  String? _reset_password_url;

  // constructor
  Rest_registrasi() {
    final config = ConfigApp();
    _get_otp_url = config.get_otp_url;
    _get_otp_reset_password_url = config.get_otp_reset_password_url;
    _register_url = config.register_url;
    _reset_password_url = config.reset_password_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();

  // Tidak perlu auth header — registrasi adalah endpoint publik
  final Map<String, String> _publicHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Future<Model_void> getOTP(String nomor_tujuan) async {
    Uri url = Uri.parse(_get_otp_url!);
    return _netUtil
        .post(url, _publicHeaders, jsonEncode({"nomor_tujuan": nomor_tujuan}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> getOTPResetPassword(String nomor_tujuan) async {
    Uri url = Uri.parse(_get_otp_reset_password_url!);
    return _netUtil
        .post(url, _publicHeaders, jsonEncode({"nomor_tujuan": nomor_tujuan}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> registrasiMember(
      String nama_pengguna,
      String nomor_whatsapp,
      String otp,
      String password,
      String kode_referal) async {
    Uri url = Uri.parse(_register_url!);
    return _netUtil
        .post(
            url,
            _publicHeaders,
            jsonEncode({
              "nama_pengguna": nama_pengguna,
              "nomor_whatsapp": nomor_whatsapp,
              "otp": otp,
              "password": password,
              "kode_referal": kode_referal
            }))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> resetPassword(String nomor_whatsapp, String otp) async {
    Uri url = Uri.parse(_reset_password_url!);
    return _netUtil
        .post(
            url,
            _publicHeaders,
            jsonEncode({
              "nomor_whatsapp": nomor_whatsapp,
              "otp": otp,
            }))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
