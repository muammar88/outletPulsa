import 'dart:convert';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/models/model_detail_deposit.dart';
import 'package:outletpulsa/models/model_info_deposit.dart';
import 'package:outletpulsa/models/model_konfirmasi_deposit.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
import 'api_headers.dart';

class Rest_deposit {
  String? _info_deposit_url;
  String? _deposit_saldo_url;
  String? _info_konfirmasi_deposit_url;
  String? _delete_konfirmasi_deposit_url;
  String? _konfirmasi_deposit_url;
  String? _detail_deposit_saldo_url;
  String? _deposit_linkqu_payment_methods_url;
  String? _deposit_linkqu_process_url;
  String? _deposit_linkqu_detail_url;

  // constructor
  Rest_deposit() {
    final config = ConfigApp();
    _info_deposit_url = config.info_deposit_url;
    _deposit_saldo_url = config.deposit_saldo_url;
    _info_konfirmasi_deposit_url = config.info_konfirmasi_deposit_url;
    _delete_konfirmasi_deposit_url = config.delete_konfirmasi_deposit_url;
    _konfirmasi_deposit_url = config.konfirmasi_deposit_url;
    _detail_deposit_saldo_url = config.detail_deposit_saldo_url;
    _deposit_linkqu_payment_methods_url = config.deposit_linkqu_payment_methods_url;
    _deposit_linkqu_process_url = config.deposit_linkqu_process_url;
    _deposit_linkqu_detail_url = config.deposit_linkqu_detail_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_info_deposit> Rest_info_deposit() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_info_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_info_deposit.map(res);
    });
  }

  Future<Model_void> depositSaldo(
      String nominal, String bank_tujuan_transfer) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_deposit_saldo_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "nominal": nominal,
              "bank_tujuan_transfer": bank_tujuan_transfer
            }))
        .then((dynamic res) async {
      print('response: $res');
      return new Model_void.map(res);
    });
  }

  Future<Model_konfirmasi_deposit> getInfoKonfirmasi() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_info_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_konfirmasi_deposit.map(res);
    });
  }

  Future<Model_void> deleteKonfirmasi() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_delete_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_void.map(res);
    });
  }

  Future<Model_void> konfirmasiDeposit() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_konfirmasi_deposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_void.map(res);
    });
  }

  Future<Model_void> getLinkquPaymentMethods() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_deposit_linkqu_payment_methods_url!);
    return _netUtil.get(url, headers).then((dynamic res) {
      if (res != null && res['error'] == false) {
        return Model_void.map({
          'error': false,
          'error_msg': res['error_msg'] ?? res['message'],
          'data': {'items': res['data']}
        });
      } else {
        return Model_void.map({
          'error': true,
          'error_msg': res != null ? (res['error_msg'] ?? res['message'] ?? 'Gagal memuat metode pembayaran') : 'Gagal terhubung ke server'
        });
      }
    });
  }

  Future<Model_void> processLinkquDeposit(int nominal, String paymentMethod, String? bankCode) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_deposit_linkqu_process_url!);
    final payload = {
      'nominal': nominal,
      'payment_method': paymentMethod,
    };
    if (bankCode != null) payload['bank_code'] = bankCode;

    return _netUtil.post(url, headers, jsonEncode(payload)).then((dynamic res) {
      if (res != null && res['error'] == false) {
        return Model_void.map({
          'error': false,
          'error_msg': res['error_msg'] ?? res['message'],
          'data': res['data']
        });
      } else {
        return Model_void.map({
          'error': true,
          'error_msg': res != null ? (res['error_msg'] ?? res['message'] ?? 'Gagal memproses deposit') : 'Gagal terhubung ke server'
        });
      }
    });
  }

  Future<Model_void> getPaymentGatewayDetail(String transactionId) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse('$_deposit_linkqu_detail_url/$transactionId');
    return _netUtil.get(url, headers).then((dynamic res) {
      if (res != null && res['error'] == false) {
        return Model_void.map({
          'error': false,
          'error_msg': res['error_msg'] ?? res['message'],
          'data': res['data']
        });
      } else {
        return Model_void.map({
          'error': true,
          'error_msg': res != null ? (res['error_msg'] ?? res['message'] ?? 'Gagal mengambil detail pembayaran') : 'Gagal terhubung ke server'
        });
      }
    });
  }

  Future<Model_detail_deposit> getDetailDeposit(String id) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_detail_deposit_saldo_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"id": id}))
        .then((dynamic res) async {
      print('response: $res');
      return new Model_detail_deposit.map(res);
    });
  }
}
