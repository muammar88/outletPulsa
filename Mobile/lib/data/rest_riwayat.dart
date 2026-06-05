import '../config/config.dart';
import '../models/model_list.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_riwayat {
  String? _getRiwayatPrabayar_url;
  String? _getRiwayatPascabayar_url;
  String? _getRiwayatDeposit_url;
  String? _getRiwayatTransferSaldo_url;
  String? _main_url;

  // constructor
  Rest_riwayat() {
    final config = ConfigApp();
    _getRiwayatPrabayar_url = config.getRiwayatPrabayar_url;
    _getRiwayatPascabayar_url = config.getRiwayatPascabayar_url;
    _getRiwayatDeposit_url = config.getRiwayatDeposit_url;
    _getRiwayatTransferSaldo_url = config.getRiwayatTransferSaldo_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  void sesi() async {}

  Future<Model_list> getRiwayatPrabayar() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getRiwayatPrabayar_url!);

    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatPascabayar() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getRiwayatPascabayar_url!);

    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatDeposit() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_main_url! + '/${kode}' + _getRiwayatDeposit_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }

  Future<Model_list> getRiwayatTransferSaldo() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _getRiwayatTransferSaldo_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list.map(res);
    });
  }
}
