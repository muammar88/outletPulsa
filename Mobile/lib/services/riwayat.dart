import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/models/model_list.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';
import 'api_headers.dart';

class Rest_riwayat {
  String? _getRiwayatPrabayar_url;
  String? _getRiwayatPascabayar_url;
  String? _getRiwayatDeposit_url;
  String? _getRiwayatTransferSaldo_url;

  // constructor
  Rest_riwayat() {
    final config = ConfigApp();
    _getRiwayatPrabayar_url = config.getRiwayatPrabayar_url;
    _getRiwayatPascabayar_url = config.getRiwayatPascabayar_url;
    _getRiwayatDeposit_url = config.getRiwayatDeposit_url;
    _getRiwayatTransferSaldo_url = config.getRiwayatTransferSaldo_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_list> getRiwayatPrabayar({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatPrabayar_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatPascabayar({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatPascabayar_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatDeposit({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatDeposit_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatTransferSaldo({String search = ""}) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatTransferSaldo_url!);
    if (search.isNotEmpty) {
      url = url.replace(queryParameters: {'search': search});
    }
    return _netUtil.get(url, headers).then((dynamic res) async {
      print('response: $res');
      return new Model_list.map(res);
    });
  }
}
