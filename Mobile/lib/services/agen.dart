import 'dart:convert';
import 'package:outletpulsa/models/model_agen.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
import 'api_headers.dart';

class Rest_agen {
  String? _daftarAgen_url;
  String? _daftarRiwayatPembayaran_url;
  String? _statistikAgen_url;
  String? _klaimAgen_url;
  String? _transaksiReseller_url;

  // constructor
  Rest_agen() {
    final config = ConfigApp();
    _daftarAgen_url = config.daftarAgen_url;
    _daftarRiwayatPembayaran_url = config.daftarRiwayatPembayaran_url;
    _statistikAgen_url = config.statistikAgen_url;
    _klaimAgen_url = config.klaimAgen_url;
    _transaksiReseller_url = config.transaksiReseller_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_agen> listAgen({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_daftarAgen_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listRiwayatPembayaran({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_daftarRiwayatPembayaran_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listStatistik() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_statistikAgen_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> klaimFee() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_klaimAgen_url!);
    // Body harus berupa JSON string (bukan Map mentah) ketika Content-Type: application/json
    return _netUtil.post(url, headers, jsonEncode({})).then((dynamic res) async {
      print('response: $res');
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listTransaksiReseller({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_transaksiReseller_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_agen.map(res);
    });
  }
}
