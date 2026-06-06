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

  // constructor
  Rest_deposit() {
    final config = ConfigApp();
    _info_deposit_url              = config.info_deposit_url;
    _deposit_saldo_url             = config.deposit_saldo_url;
    _info_konfirmasi_deposit_url   = config.info_konfirmasi_deposit_url;
    _delete_konfirmasi_deposit_url = config.delete_konfirmasi_deposit_url;
    _konfirmasi_deposit_url        = config.konfirmasi_deposit_url;
    _detail_deposit_saldo_url      = config.detail_deposit_saldo_url;
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

  Future<Model_info_deposit> Rest_info_deposit() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_info_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_info_deposit.map(res);
    });
  }

  Future<Model_void> depositSaldo(
      String nominal, String bank_tujuan_transfer) async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_deposit_saldo_url!);
    return _netUtil
        .post(url, headers,
            jsonEncode({
              "nominal": nominal,
              "bank_tujuan_transfer": bank_tujuan_transfer
            }))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_konfirmasi_deposit> getInfoKonfirmasi() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_info_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_konfirmasi_deposit.map(res);
    });
  }

  Future<Model_void> deleteKonfirmasi() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_delete_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_void> konfirmasiDeposit() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_detail_deposit> getDetailDeposit(id) async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_detail_deposit_saldo_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"id": id}))
        .then((dynamic res) async {
      return new Model_detail_deposit.map(res);
    });
  }
}
