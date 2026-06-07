import 'package:flutter/material.dart';
import '../services/registrasi.dart';
import '../models/model_void.dart';

class Registrasi_provider with ChangeNotifier {
  Future<Model_void> getOTP(String nomor_whatsapp) async {
    return await Rest_registrasi()
        .getOTP(nomor_whatsapp)
        .then((Model_void e) async {
      if (e.error == true) {
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }

  Future<Model_void> getOTPResetPassword(String nomor_whatsapp) async {
    return await Rest_registrasi()
        .getOTPResetPassword(nomor_whatsapp)
        .then((Model_void e) async {
      if (e.error == true) {
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }

  Future<Model_void> registrasiMember(
      String nama_pengguna,
      String nomor_whatsapp,
      String otp,
      String password,
      String kode_referal) async {
    return await Rest_registrasi()
        .registrasiMember(
            nama_pengguna, nomor_whatsapp, otp, password, kode_referal)
        .then((Model_void e) async {
      if (e.error == true) {
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }

  Future<Model_void> resetPassword(String nomor_whatsapp, String otp) async {
    return await Rest_registrasi()
        .resetPassword(nomor_whatsapp, otp)
        .then((Model_void e) async {
      if (e.error == true) {
        return new Model_void.map({'error': true, 'error_msg': e.errorMsg});
      } else {
        return new Model_void.map({'error': false, 'error_msg': e.errorMsg});
      }
    });
  }
}
