import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/core/storage/SQLHelper.dart';
import 'package:outletpulsa/module/member/main.dart';
import 'package:outletpulsa/module/public/login.dart';
import 'package:outletpulsa/module/public/server_unavailable_page.dart';
import 'package:outletpulsa/shared/providers/AuthenticationProvider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final ConfigApp config = ConfigApp();

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // 1. Health check
    bool isHealthy = await _checkHealth();
    if (!mounted) return;
    if (!isHealthy) {
      _goToUnavailablePage();
      return;
    }

    // 2. Cek Device Code di SQLite
    final db = SQLHelper();
    String? deviceCode = await db.getDeviceCode();

    // 3. Registrasi atau Validasi Device
    if (deviceCode == null) {
      deviceCode = await _registerDevice();
      if (!mounted) return;
      if (deviceCode == null) {
        _goToUnavailablePage();
        return;
      }
      await db.saveDeviceCode(deviceCode);
    } else {
      bool isValid = await _validateDevice(deviceCode);
      if (!mounted) return;
      if (!isValid) {
        // Jika tidak valid, registrasi ulang dengan mempertahankan deviceCode lama
        String? newCode = await _registerDevice(existingDeviceCode: deviceCode);
        if (!mounted) return;
        if (newCode == null) {
          _goToUnavailablePage();
          return;
        }
      }
    }

    // 4. Lanjutkan ke logic autentikasi
    if (!mounted) return;
    _checkAuth();
  }

  Future<bool> _checkHealth() async {
    try {
      final response = await http.get(Uri.parse(config.health_url!)).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        var body = jsonDecode(response.body);
        return body['data'] != null && body['data']['success'] == true;
      }
    } catch (e) {
      debugPrint("Health Check Failed: $e");
    }
    return false;
  }

  Future<Map<String, String>> _getDeviceInfo() async {
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    PackageInfo packageInfo = await PackageInfo.fromPlatform();
    
    String deviceName = 'Unknown';
    String deviceBrand = 'Unknown';
    String deviceModel = 'Unknown';
    String osName = Platform.operatingSystem;
    String osVersion = Platform.operatingSystemVersion;
    String appVersion = packageInfo.version;

    if (Platform.isAndroid) {
      AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
      deviceName = androidInfo.device ?? 'Unknown';
      deviceBrand = androidInfo.brand ?? 'Unknown';
      deviceModel = androidInfo.model ?? 'Unknown';
      osVersion = androidInfo.version.release ?? 'Unknown';
    } else if (Platform.isIOS) {
      IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
      deviceName = iosInfo.name ?? 'Unknown';
      deviceBrand = 'Apple';
      deviceModel = iosInfo.model ?? 'Unknown';
      osVersion = iosInfo.systemVersion ?? 'Unknown';
    }

    return {
      "device_name": deviceName,
      "device_brand": deviceBrand,
      "device_model": deviceModel,
      "os_name": osName,
      "os_version": osVersion,
      "app_version": appVersion,
    };
  }

  Future<String?> _registerDevice({String? existingDeviceCode}) async {
    try {
      final deviceInfo = await _getDeviceInfo();
      if (existingDeviceCode != null) {
        deviceInfo["device_code"] = existingDeviceCode;
      }
      final response = await http.post(
        Uri.parse(config.device_register_url!),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(deviceInfo),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 201 || response.statusCode == 200) {
        var data = jsonDecode(response.body);
        return data['data']['device_code'];
      }
    } catch (e) {
      debugPrint("Device Registration Failed: $e");
    }
    return null;
  }

  Future<bool> _validateDevice(String deviceCode) async {
    try {
      final response = await http.post(
        Uri.parse(config.device_validate_url!),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"device_code": deviceCode}),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        var body = jsonDecode(response.body);
        return body['data'] != null && body['data']['valid'] == true;
      }
    } catch (e) {
      debugPrint("Device Validation Failed: $e");
    }
    return false;
  }

  void _goToUnavailablePage() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (newContext) => ServerUnavailablePage(
          onRetry: () {
            Navigator.of(newContext).pushReplacement(
              MaterialPageRoute(builder: (_) => const SplashScreen()),
            );
          },
        ),
      ),
    );
  }

  void _checkAuth() async {
    final auth = Provider.of<Authentication_provider>(context, listen: false);
    await auth.check_login();
    
    if (!mounted) return;
    if (auth.isLogin) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => Home_page()));
    } else {
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => Login_page()));
    }
  }

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;
    return Scaffold(
      body: Container(
        width: size.width,
        height: size.height,
        color: Colors.white,
        child: Stack(
          children: [
            // Background Ornaments
            Positioned(
              top: -80,
              right: -50,
              child: _buildCircle(250, 0.03),
            ),
            Positioned(
              top: 100,
              right: 60,
              child: _buildCircle(120, 0.02),
            ),
            Positioned(
              bottom: -60,
              left: -60,
              child: _buildCircle(200, 0.03),
            ),

            // Main Content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo with glow effect
                  TweenAnimationBuilder<double>(
                    tween: Tween<double>(begin: 0.0, end: 1.0),
                    duration: const Duration(milliseconds: 1200),
                    curve: Curves.easeOutCubic,
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: 0.8 + (0.2 * value),
                        child: Opacity(
                          opacity: value,
                          child: child,
                        ),
                      );
                    },
                    child: Image.asset(
                      'assets/img/vertical-logo.png',
                      height: 90,
                      fit: BoxFit.contain,
                    ),
                  ),
                  
                  const SizedBox(height: 56),
                  
                  // Loader
                  TweenAnimationBuilder<double>(
                    tween: Tween<double>(begin: 0.0, end: 1.0),
                    duration: const Duration(milliseconds: 800),
                    curve: Curves.easeIn,
                    builder: (context, value, child) {
                      return Opacity(
                        opacity: value,
                        child: child,
                      );
                    },
                    child: Column(
                      children: [
                        SizedBox(
                          width: 36,
                          height: 36,
                          child: CircularProgressIndicator(
                            color: config.btn_primary_color,
                            strokeWidth: 3,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          "Menyiapkan Layanan...",
                          style: TextStyle(
                            color: config.text_dark_color,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            
            // App Version at bottom
            Positioned(
              bottom: 30,
              left: 0,
              right: 0,
              child: FutureBuilder<PackageInfo>(
                future: PackageInfo.fromPlatform(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return Text(
                      "Versi ${snapshot.data!.version}",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: config.text_grey_color,
                        fontSize: 12,
                        letterSpacing: 1.0,
                      ),
                    );
                  }
                  return const SizedBox();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircle(double size, double opacity) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: config.btn_primary_color.withOpacity(opacity),
      ),
    );
  }
}
