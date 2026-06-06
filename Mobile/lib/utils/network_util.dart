import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class NetworkUtil {
  // Singleton pattern
  static NetworkUtil _instance = new NetworkUtil.internal();
  NetworkUtil.internal();
  factory NetworkUtil() => _instance;

  final JsonDecoder _decoder = new JsonDecoder();

  Future<dynamic> get(Uri url, headers) async {
    print('==============================');
    print('API GET URL: $url');
    print('HEADERS: $headers');
    print('==============================');
    return http.get(url, headers: headers).then((http.Response response) {
      final String res = response.body;
      final int statusCode = response.statusCode;
      print('RESPONSE [${statusCode}] GET $url => $res');
      if (statusCode < 200 || statusCode >= 400) {
        throw new Exception("Error while fetching data (status: $statusCode)");
      }
      return _decoder.convert(res);
    });
  }

  Future<dynamic> post(
    Uri url,
    headers,
    body,
  ) async {
    print('==============================');
    print('API POST URL: $url');
    print('HEADERS: $headers');
    print('BODY: $body');
    print('==============================');
    return http
        .post(url, headers: headers, body: body)
        .then((http.Response response) {
      final String res = response.body;
      final int statusCode = response.statusCode;
      print('RESPONSE [${statusCode}] POST $url => $res');
      if (statusCode < 200 || statusCode >= 400) {
        throw new Exception("Error while fetching data (status: $statusCode)");
      }
      return _decoder.convert(res);
    });
  }

  Future<dynamic> post_login(
    Uri url,
    body,
  ) async {
    print('POST_LOGIN HIT: $url');
    print('BODY: $body');
    return http.post(url, body: body).then((http.Response response) {
      print('RESPONSE STATUS: ${response.statusCode}');
      print('RESPONSE BODY: ${response.body}');
      final String res = response.body;
      final int statusCode = response.statusCode;
      if (statusCode < 200 || statusCode >= 400) {
        throw new Exception("Error while fetching data (status: $statusCode)");
      }
      return _decoder.convert(res);
    });
  }
}
