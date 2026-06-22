import 'dart:convert';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/storage/ModelSQL.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
import 'api_headers.dart';

class Rest_akun {
  String? _updateNamaAkun_url;
  String? _updatePasswordAkun_url;
  String? _transferSaldo_url;

  // constructor
  Rest_akun() {
    final config = ConfigApp();
    _updateNamaAkun_url = config.updateNamaAkun_url;
    _updatePasswordAkun_url = config.updatePasswordAkun_url;
    _transferSaldo_url = config.transferSaldo_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_void> updateNamaAkun(name) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_updateNamaAkun_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"nama": name}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> updatePasswordAkun(
      passwordLama, passwordBaru, konfirmasiPasswordBaru) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    final username = dataProfils['username'];
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_updatePasswordAkun_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "passwordLama": passwordLama,
              "passwordBaru": passwordBaru,
              "konfirmasiPassword": konfirmasiPasswordBaru,
            }))
        .then((dynamic res) async {
      if (res['error'] == false) {
        var dataProfil =
            ModelSQL(id: '1', kode: kode, username: username, token: token);
        db.editDataProfil(dataProfil);
      }
      return new Model_void.map(res);
    });
  }

  Future<Model_void> transferSaldo(nomor_tujuan, nominal, password) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_transferSaldo_url!);
    return _netUtil
        .post(url, headers,
            jsonEncode({"nomor_tujuan": nomor_tujuan, "nominal": nominal, "password": password}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
