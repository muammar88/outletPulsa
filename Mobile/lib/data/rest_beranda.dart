import '../config/config.dart';
import '../models/model_beranda.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_beranda {
  String? _beranda_url;
  String? _main_url;

  // constructor
  Rest_beranda() {
    final config = ConfigApp();
    _beranda_url = config.beranda_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_beranda> Rest_data_beranda() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Uri url = Uri.parse(_main_url! + '/${kode}' + _beranda_url!);
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      print("-----res");
      print(res);
      print("-----res");
      return new Model_beranda.map(res);
    });
  }
}
