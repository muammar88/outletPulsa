import 'dart:convert';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/models/model_list.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
import 'api_headers.dart';

class Rest_info {
  String? _getInfoBelumBaca_url;
  String? _getInfoSudahBaca_url;
  String? _updateStatusBaca_url;

  // constructor
  Rest_info() {
    final config = ConfigApp();
    _getInfoBelumBaca_url = config.getInfoBelumBaca_url;
    _getInfoSudahBaca_url = config.getInfoSudahBaca_url;
    _updateStatusBaca_url = config.updateStatusBaca_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_list> getInfoBelumBaca() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getInfoBelumBaca_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getInfoSudahBaca() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getInfoSudahBaca_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_void> updateStatusBaca(id) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_updateStatusBaca_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"id": id}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }
}
