import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/models/model_beranda.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/core/utils/network_util.dart';

class Rest_beranda {
  String? _beranda_url;

  // constructor
  Rest_beranda() {
    final config = ConfigApp();
    _beranda_url = config.beranda_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_beranda> Rest_data_beranda() async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    Uri url = Uri.parse(_beranda_url!);

    print('url beranda: $url');
    print('token: $token');

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_beranda.map(res);
    });
  }
}
