import 'dart:convert';
import '../config/config.dart';
import '../models/model_detail_deposit.dart';
import '../models/model_info_deposit.dart';
import '../models/model_konfirmasi_deposit.dart';
import '../models/model_void.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_deposit {
  String? _info_deposit_url;
  String? _deposit_saldo_url;
  String? _info_konfirmasi_deposit_url;
  String? _delete_konfirmasi_deposit_url;
  String? _konfirmasi_deposit_url;
  String? _detail_deposit_saldo_url;
  String? _main_url;

  // constructor
  Rest_deposit() {
    final config = ConfigApp();
    _info_deposit_url = config.info_deposit_url;
    _deposit_saldo_url = config.deposit_saldo_url;
    _info_konfirmasi_deposit_url = config.info_konfirmasi_deposit_url;
    _delete_konfirmasi_deposit_url = config.delete_konfirmasi_deposit_url;
    _konfirmasi_deposit_url = config.konfirmasi_deposit_url;
    _detail_deposit_saldo_url = config.detail_deposit_saldo_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_info_deposit> Rest_info_deposit() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url = Uri.parse(_main_url! + '/${kode}' + _info_deposit_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      print(res);
      return new Model_info_deposit.map(res);
    });
  }

  Future<Model_void> depositSaldo(
      String nominal, String bank_tujuan_transfer) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_main_url! + '/${kode}' + _deposit_saldo_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "nominal": nominal,
              "bank_tujuan_transfer": bank_tujuan_transfer
            }))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_konfirmasi_deposit> getInfoKonfirmasi() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _info_konfirmasi_deposit_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      print("=====res");
      print(res);
      print("=====res");
      return new Model_konfirmasi_deposit.map(res);
    });
  }

  Future<Model_void> deleteKonfirmasi() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _delete_konfirmasi_deposit_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> konfirmasiDeposit() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url = Uri.parse(_main_url! + '/${kode}' + _konfirmasi_deposit_url!);

    print("=====url");
    print(url);
    print("=====url");

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    print("=====headers");
    print(headers);
    print("=====headers");
    return _netUtil.get(url, headers).then((dynamic res) async {
      print("=====res");
      print(res);
      print("=====res");
      return new Model_void.map(res);
    });
  }

  Future<Model_detail_deposit> getDetailDeposit(id) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    print("++++++++++++id");
    print(id);
    print("++++++++++++id");
    Uri url = Uri.parse(_main_url! + '/${kode}' + _detail_deposit_saldo_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"id": id}))
        .then((dynamic res) async {
      print("xxxxxxxxxxxx");
      print(res);
      print("xxxxxxxxxxxx");
      return new Model_detail_deposit.map(res);
    });
  }
}
