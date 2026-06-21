import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class Session {
  Map<String, String> headers = {};

  Future<Map> get(Uri url) async {
    debugPrint('==============================\n⬆️ SESSION GET URL: $url\nHEADERS: $headers\n==============================');
    http.Response response = await http.get(url, headers: headers);
    debugPrint('📥 SESSION RESPONSE [${response.statusCode}] $url\nData: ${response.body}\n==============================');
    return json.decode(response.body);
  }

  Future<Map> post(
      Uri url, Map<String, String> headers, Map<String, dynamic> body) async {
    debugPrint('==============================\n⬆️ SESSION POST URL: $url\nHEADERS: $headers\nBODY: $body\n==============================');
    http.Response response = await http.post(url, body: body, headers: headers);
    debugPrint('📥 SESSION RESPONSE [${response.statusCode}] $url\nData: ${response.body}\n==============================');
    return json.decode(response.body);
  }
}
