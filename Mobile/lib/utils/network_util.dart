import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class NetworkUtil {
  // Singleton pattern
  static NetworkUtil _instance = new NetworkUtil.internal();
  NetworkUtil.internal();
  factory NetworkUtil() => _instance;

  final JsonDecoder _decoder = new JsonDecoder();
  static const int TIMEOUT_SECONDS = 30;

  dynamic _handleError(dynamic error) {
    print('NETWORK ERROR: $error');
    String msg = "Terjadi kesalahan pada layanan, silakan coba beberapa saat lagi.";
    if (error is SocketException) {
      msg = "Server sedang tidak dapat diakses atau koneksi internet Anda terputus.";
    } else if (error is TimeoutException) {
      msg = "Waktu permintaan habis (Timeout). Silakan coba lagi.";
    } else if (error is FormatException) {
      msg = "Respons dari server tidak valid.";
    } else if (error is Exception) {
      msg = error.toString().replaceAll("Exception: ", "");
    }
    
    // Kembalikan map JSON error agar dapat dibaca oleh Model_list / Model_void tanpa menyebabkan exception mentah
    return {
      "error": true,
      "error_msg": msg,
      "data": {}
    };
  }

  dynamic _processResponse(http.Response response, Uri url) {
    final String res = response.body;
    final int statusCode = response.statusCode;
    print('RESPONSE [$statusCode] $url => $res');
    
    if (statusCode < 200 || statusCode >= 400) {
      String errMsg = "Terjadi kesalahan (status: $statusCode).";
      try {
        final decoded = _decoder.convert(res);
        if (decoded is Map && decoded.containsKey('error_msg')) {
          errMsg = decoded['error_msg'];
        } else if (decoded is Map && decoded.containsKey('message')) {
          errMsg = decoded['message'];
        } else {
          if (statusCode == 404) errMsg = "Layanan tidak ditemukan (404).";
          if (statusCode >= 500) errMsg = "Server sedang mengalami gangguan (500).";
          if (statusCode == 401 || statusCode == 403) errMsg = "Sesi telah habis atau akses ditolak.";
        }
      } catch (e) {
        if (statusCode == 404) errMsg = "Layanan tidak ditemukan (404).";
        if (statusCode >= 500) errMsg = "Server sedang mengalami gangguan (500).";
        if (statusCode == 401 || statusCode == 403) errMsg = "Sesi telah habis atau akses ditolak.";
      }
      throw Exception(errMsg);
    }
    
    // Normal response processing
    try {
      return _decoder.convert(res);
    } catch (e) {
      throw FormatException("Gagal membaca data dari server.");
    }
  }

  Future<dynamic> get(Uri url, headers) async {
    print('==============================');
    print('API GET URL: $url');
    print('HEADERS: $headers');
    print('==============================');
    try {
      final response = await http
          .get(url, headers: headers)
          .timeout(const Duration(seconds: TIMEOUT_SECONDS));
      return _processResponse(response, url);
    } catch (e) {
      return _handleError(e);
    }
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
    try {
      final response = await http
          .post(url, headers: headers, body: body)
          .timeout(const Duration(seconds: TIMEOUT_SECONDS));
      return _processResponse(response, url);
    } catch (e) {
      return _handleError(e);
    }
  }

  Future<dynamic> post_login(
    Uri url,
    body,
  ) async {
    print('POST_LOGIN HIT: $url');
    print('BODY: $body');
    try {
      final response = await http
          .post(url, body: body)
          .timeout(const Duration(seconds: TIMEOUT_SECONDS));
      return _processResponse(response, url);
    } catch (e) {
      return _handleError(e);
    }
  }
}
