import 'dart:convert';
import '../config/config.dart';
import '../models/model_void.dart';
import '../sql/ModelSQL.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_akun {
  String? _updateNamaAkun_url;
  String? _updatePasswordAkun_url;
  String? _transferSaldo_url;

  // constructor
  Rest_akun() {
    final config = ConfigApp();
    _updateNamaAkun_url    = config.updateNamaAkun_url;
    _updatePasswordAkun_url = config.updatePasswordAkun_url;
    _transferSaldo_url     = config.transferSaldo_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Map<String, String>> _buildHeaders() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<Model_void> updateNamaAkun(name) async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_updateNamaAkun_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"name": name}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> updatePasswordAkun(
      passwordLama, passwordBaru, konfirmasiPasswordBaru) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode  = dataProfils['kode'];
    final username = dataProfils['username'];
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_updatePasswordAkun_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "password_lama": passwordLama,
              "password_baru": passwordBaru,
              "konfirmasi_password_baru": konfirmasiPasswordBaru,
            }))
        .then((dynamic res) async {
      if (res['error'] == false) {
        var dataProfil = ModelSQL(
            id: '1', kode: kode, username: username, token: token);
        db.editDataProfil(dataProfil);
      }
      return new Model_void.map(res);
    });
  }

  Future<Model_void> transferSaldo(nomor_tujuan, nominal) async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_transferSaldo_url!);
    return _netUtil
        .post(url, headers,
            jsonEncode({"nomor_tujuan": nomor_tujuan, "nominal": nominal}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
