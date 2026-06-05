import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class NetworkUtil {
  // Map<String, String> headers = {};

  // next three lines makes this class a Singleton
  static NetworkUtil _instance = new NetworkUtil.internal();
  NetworkUtil.internal();
  factory NetworkUtil() => _instance;

  final JsonDecoder _decoder = new JsonDecoder();

  Future<dynamic> get(Uri url, headers) async {
    // print("xxxxxxxxx-----url");
    // print(url);
    // print("xxxxxxxxx-----url");

    return http.get(url, headers: headers).then((http.Response response) {
      final String res = response.body;
      // print(' Response -----');
      // print(res);
      // print(' Response -----');
      final int statusCode = response.statusCode;
      if (statusCode != 200 || statusCode > 400 || json == null) {
        throw new Exception("Error while fetching data");
      }
      // print("Type+++++++++++++++++++");
      // print(res.runtimeType);
      // print("Type+++++++++++++++++++");
      return _decoder.convert(res);
    });
  }

  Future<dynamic> post(
    Uri url,
    headers,
    body,
  ) async {
    // print("xxxxxxxxx-----url");
    // print(url);
    // print("xxxxxxxxx-----url");
    return http
        .post(url, headers: headers, body: body)
        .then((http.Response response) {
      final String res = response.body;
      final int statusCode = response.statusCode;
      if (statusCode < 200 || statusCode > 400 || json == null) {
        throw new Exception("Error while fetching data");
      }
      // print(' Response ');
      // print(response);
      // print(' Response ');
      // // final String res = response.body;
      // print(' Response -----');
      // print(res);
      // print(' Response -----');
      return _decoder.convert(res);
    });
  }

  Future<dynamic> post_login(
    Uri url,
    body,
  ) async {
    return http.post(url, body: body).then((http.Response response) {
      final String res = response.body;
      final int statusCode = response.statusCode;
      // print("______________");
      // print(statusCode);
      // print("______________");
      if (statusCode < 200 || statusCode > 400 || json == null) {
        throw new Exception("Error while fetching data");
      }
      return _decoder.convert(res);
    });
  }
}
