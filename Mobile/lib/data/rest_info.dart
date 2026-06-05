import 'dart:convert';
import '../config/config.dart';
import '../models/model_list.dart';
import '../models/model_void.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_info {
  String? _getInfoBelumBaca_url;
  String? _getInfoSudahBaca_url;
  String? _updateStatusBaca_url;
  String? _main_url;

  // constructor
  Rest_info() {
    final config = ConfigApp();
    _getInfoBelumBaca_url = config.getInfoBelumBaca_url;
    _getInfoSudahBaca_url = config.getInfoSudahBaca_url;
    _updateStatusBaca_url = config.updateStatusBaca_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  void sesi() async {}

  Future<Model_list> getInfoBelumBaca() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getInfoBelumBaca_url!);

    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getInfoSudahBaca() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getInfoSudahBaca_url!);

    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_void> updateStatusBaca(id) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_main_url! + '/${kode}' + _updateStatusBaca_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"id": id}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
