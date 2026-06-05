import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class Session {
  Map<String, String> headers = {};

  Future<Map> get(Uri url) async {
    http.Response response = await http.get(url, headers: headers);
    return json.decode(response.body);
  }

  Future<Map> post(
      Uri url, Map<String, String> headers, Map<String, dynamic> body) async {
    http.Response response = await http.post(url, body: body, headers: headers);
    return json.decode(response.body);
  }
}
