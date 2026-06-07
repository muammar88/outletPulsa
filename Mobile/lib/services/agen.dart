import 'package:outletpulsa/models/model_agen.dart';
import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/sql/SQLHelper.dart';
import 'package:outletpulsa/utils/network_util.dart';
import 'api_headers.dart';

class Rest_agen {
  String? _daftarAgen_url;
  String? _daftarRiwayatPembayaran_url;

  // constructor
  Rest_agen() {
    final config = ConfigApp();
    _daftarAgen_url = config.daftarAgen_url;
    _daftarRiwayatPembayaran_url = config.daftarRiwayatPembayaran_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_agen> listAgen() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_daftarAgen_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listRiwayatPembayaran() async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_daftarRiwayatPembayaran_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_agen.map(res);
    });
  }
}
