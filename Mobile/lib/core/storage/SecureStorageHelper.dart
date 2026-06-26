import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageHelper {
  static final SecureStorageHelper _instance = SecureStorageHelper._internal();
  factory SecureStorageHelper() => _instance;
  SecureStorageHelper._internal();

  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Keys
  static const String _keyToken = 'auth_token';
  static const String _keyDeviceCode = 'device_code';

  // In-memory cache
  String? _cachedToken;
  String? _cachedDeviceCode;
  bool _isTokenCached = false;
  bool _isDeviceCodeCached = false;

  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
    _cachedToken = token;
    _isTokenCached = true;
  }

  Future<String?> getToken() async {
    if (_isTokenCached) return _cachedToken;
    _cachedToken = await _storage.read(key: _keyToken);
    _isTokenCached = true;
    return _cachedToken;
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _keyToken);
    _cachedToken = null;
    _isTokenCached = true;
  }

  Future<void> saveDeviceCode(String deviceCode) async {
    await _storage.write(key: _keyDeviceCode, value: deviceCode);
    _cachedDeviceCode = deviceCode;
    _isDeviceCodeCached = true;
  }

  Future<String?> getDeviceCode() async {
    if (_isDeviceCodeCached) return _cachedDeviceCode;
    _cachedDeviceCode = await _storage.read(key: _keyDeviceCode);
    _isDeviceCodeCached = true;
    return _cachedDeviceCode;
  }

  Future<void> deleteAll() async {
    await _storage.deleteAll();
    _cachedToken = null;
    _cachedDeviceCode = null;
    _isTokenCached = true;
    _isDeviceCodeCached = true;
  }
}
