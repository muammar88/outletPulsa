import 'package:outletpulsa/models/model_agen.dart';
import '../config/config.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_agen {
  String? _daftarAgen_url;
  String? _daftarRiwayatPembayaran_url;

  // constructor
  Rest_agen() {
    final config = ConfigApp();
    _daftarAgen_url              = config.daftarAgen_url;
    _daftarRiwayatPembayaran_url = config.daftarRiwayatPembayaran_url;
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

  Future<Model_agen> listAgen() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_daftarAgen_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_agen.map(res);
    });
  }

  Future<Model_agen> listRiwayatPembayaran() async {
    final headers = await _buildHeaders();
    Uri url = Uri.parse(_daftarRiwayatPembayaran_url!);
    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_agen.map(res);
    });
  }
}
