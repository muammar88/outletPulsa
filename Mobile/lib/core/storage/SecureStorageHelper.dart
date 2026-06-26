import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class SecureStorageHelper {
  static final SecureStorageHelper _instance = SecureStorageHelper._internal();
  factory SecureStorageHelper() => _instance;
  SecureStorageHelper._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  // Keys
  static const String _keyToken = 'auth_token';
  static const String _keyDeviceCode = 'device_code';

  // In-memory cache
  String? _cachedToken;
  String? _cachedDeviceCode;
  bool _isTokenCached = false;
  bool _isDeviceCodeCached = false;

  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _keyToken, value: token);
      _cachedToken = token;
      _isTokenCached = true;
    } catch (e) {
      debugPrint('SecureStorage Error saveToken: $e');
      await deleteAll();
    }
  }

  Future<String?> getToken() async {
    if (_isTokenCached) return _cachedToken;
    try {
      _cachedToken = await _storage.read(key: _keyToken);
      _isTokenCached = true;
      return _cachedToken;
    } catch (e) {
      debugPrint('SecureStorage Error getToken: $e');
      await deleteAll();
      return null;
    }
  }

  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _keyToken);
      _cachedToken = null;
      _isTokenCached = true;
    } catch (e) {
      debugPrint('SecureStorage Error deleteToken: $e');
      await deleteAll();
    }
  }

  Future<void> saveDeviceCode(String deviceCode) async {
    try {
      await _storage.write(key: _keyDeviceCode, value: deviceCode);
      _cachedDeviceCode = deviceCode;
      _isDeviceCodeCached = true;
    } catch (e) {
      debugPrint('SecureStorage Error saveDeviceCode: $e');
      await deleteAll();
    }
  }

  Future<String?> getDeviceCode() async {
    if (_isDeviceCodeCached) return _cachedDeviceCode;
    try {
      _cachedDeviceCode = await _storage.read(key: _keyDeviceCode);
      _isDeviceCodeCached = true;
      return _cachedDeviceCode;
    } catch (e) {
      debugPrint('SecureStorage Error getDeviceCode: $e');
      await deleteAll();
      return null;
    }
  }

  Future<void> deleteAll() async {
    try {
      await _storage.deleteAll();
    } catch (e) {
      debugPrint('SecureStorage Error deleteAll: $e');
    }
    _cachedToken = null;
    _cachedDeviceCode = null;
    _isTokenCached = true;
    _isDeviceCodeCached = true;
  }
}
