import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/models/model_list.dart';
import 'package:outletpulsa/sql/SQLHelper.dart';
import 'package:outletpulsa/utils/network_util.dart';
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

  Future<Model_list> getRiwayatPrabayar() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatPrabayar_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatPascabayar() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatPascabayar_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatDeposit() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatDeposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatTransferSaldo() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getRiwayatTransferSaldo_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }
}
