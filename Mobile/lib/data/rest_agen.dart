import 'dart:convert';
import 'package:outletpulsa/models/model_agen.dart';
import '../config/config.dart';
import '../models/model_void.dart';
import '../sql/SQLHelper.dart';
import '../sql/ModelSQL.dart';
import '../utils/network_util.dart';

class Rest_agen {
  String? _daftarAgen_url;
  String? _daftarRiwayatPembayaran_url;
  String? _main_url;

  // constructor
  Rest_agen() {
    final config = ConfigApp();
    _daftarAgen_url = config.daftarAgen_url;
    _daftarRiwayatPembayaran_url = config.daftarRiwayatPembayaran_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_agen> listAgen() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url = Uri.parse(_main_url! + '/${kode}' + _daftarAgen_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listRiwayatPembayaran() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _daftarRiwayatPembayaran_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    print("--------headers");
    print(url);
    print(headers);
    print("--------headers");

    return _netUtil.get(url, headers).then((dynamic res) async {
      print("--------res");
      print(res);
      print("--------res");
      return new Model_agen.map(res);
    });
  }
}
