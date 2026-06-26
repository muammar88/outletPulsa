import 'package:outletpulsa/core/storage/SQLHelper.dart';

class ApiHeaders {
  static final SQLHelper _db = SQLHelper();

  static Future<Map<String, String>> getHeaders() async {
    Map<String, dynamic>? dataProfils = await _db.getSingleData('1');
    final token = dataProfils!['token'];
    final deviceCode = await _db.getDeviceCode();

    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    if (deviceCode != null && deviceCode.isNotEmpty) {
      headers['x-device-code'] = deviceCode;
    }

    return headers;
  }
}
