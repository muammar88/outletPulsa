import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../../main.dart';
import '../../module/member/widget/pengumuman/Detail_pengumuman.dart';
import '../../module/member/widget/beranda/transaksi/detail_transaksi.dart';
import '../../module/member/widget/beranda/transaksi/detail_transaksi_pascabayar.dart';
import '../../module/member/widget/beranda/transaksi/detail_deposit.dart';
import '../../core/storage/SecureStorageHelper.dart';
import 'package:http/http.dart' as http;

import 'package:provider/provider.dart';
import '../../core/constants/config.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/socket/socket_service.dart';
import 'BerandaProvider.dart';

class PengumumanProvider extends ChangeNotifier {
  FirebaseMessaging? _firebaseMessaging;
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _initialized = false;

  List<dynamic> _listPengumuman = [];
  List<dynamic> get listPengumuman => _listPengumuman;

  Future<void> initPengumuman() async {
    if (_initialized) return;
    try {
      _firebaseMessaging = FirebaseMessaging.instance;
      
      // Request permission
      NotificationSettings settings = await _firebaseMessaging!.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('User granted permission: ${settings.authorizationStatus}');

      // Setup foreground listener
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Got a message whilst in the foreground!');
        debugPrint('Message data: ${message.data}');

        if (message.notification != null) {
          debugPrint('Message also contained a Pengumuman: ${message.notification}');
          // You could show a local snackbar or flushbar here if desired.
          // Or just fetch the latest Pengumumans
          fetchMobileHistory();
        }
      });

      // Listen to Socket.IO real-time updates for Pengumuman
      SocketService().onAnnouncement.listen((data) {
        debugPrint('Got announcement from Socket.IO: $data');
        fetchMobileHistory();
      });

      // Handle when app is opened from a terminated state
      FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) async {
        if (message != null) {
          debugPrint('Opened from terminated state with message: ${message.data}');
          
          final prefs = await SharedPreferences.getInstance();
          final lastId = prefs.getString('last_handled_fcm_id');
          final currentId = message.messageId;

          if (currentId != null && currentId == lastId) {
             debugPrint('Ignoring already handled initial message on hot restart');
             return;
          }

          if (currentId != null) {
             await prefs.setString('last_handled_fcm_id', currentId);
          }

          _handlePengumumanClick(message);
        }
      });

      // Handle when app is opened from background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('Opened from background state with message: ${message.data}');
        _handlePengumumanClick(message);
      });

      // Get FCM Token and send to backend
      String? token = await _firebaseMessaging!.getToken();
      if (token != null) {
        debugPrint('FCM Token: $token');
        await updateFcmToken(token);
      }

      // Listen to token refresh
      _firebaseMessaging!.onTokenRefresh.listen((newToken) {
        debugPrint('FCM Token Refreshed: $newToken');
        updateFcmToken(newToken);
      });

      _initialized = true;
    } catch (e) {
      _initialized = false;
      debugPrint('Error init Pengumuman: $e');
    }
  }

  void _handlePengumumanClick(RemoteMessage message) {
    String title = message.notification?.title ?? "Info";
    String body = message.notification?.body ?? "";
    String id = message.data['pengumumanId']?.toString() ?? "";
    String type = message.data['pengumumanType']?.toString() ?? "announcement";
    String referenceId = message.data['reference_id']?.toString() ?? "";
    
    if (navigatorKey.currentState != null && id.isNotEmpty) {
       Widget destination;
       
       switch (type.toLowerCase()) {
         case 'prabayar':
           destination = Detail_transaksi(kodeTrans: referenceId);
           break;
         case 'pascabayar':
           destination = Detail_transaksi_pascabayar(kodeTrans: referenceId);
           break;
         case 'deposit':
           destination = Detail_deposit(status: '', id: referenceId);
           break;
         default:
           destination = Detail_pengumuman(
             id: id,
             title: title,
             desc: body,
           );
       }

       // Refresh beranda state since app might have missed socket event while in background
       try {
         Provider.of<Beranda_provider>(navigatorKey.currentContext!, listen: false).get_data_beranda();
       } catch (e) {
         debugPrint('Could not refresh Beranda: $e');
       }

       navigatorKey.currentState!.push(
         MaterialPageRoute(
           builder: (_) => destination
         )
       );
    }
  }

  Future<void> updateFcmToken(String fcmToken) async {
    final secureStorage = SecureStorageHelper();
    String? token = await secureStorage.getToken();
    String? deviceCode = await secureStorage.getDeviceCode();

    if (token == null || deviceCode == null) return;

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/pengumumans/fcm-token');
      var response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'x-device-code': deviceCode,
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'fcm_token': fcmToken
        }),
      );

      debugPrint('Update FCM Token Response: ${response.statusCode} - ${response.body}');
    } catch (e) {
      debugPrint('Error update FCM Token: $e');
    }
  }

  Future<void> fetchMobileHistory() async {
    debugPrint('==== fetchMobileHistory CALLED ====');
    _isLoading = true;
    WidgetsBinding.instance.addPostFrameCallback((_) => notifyListeners());

    final secureStorage = SecureStorageHelper();
    String? token = await secureStorage.getToken();
    String? deviceCode = await secureStorage.getDeviceCode();

    if (token == null || deviceCode == null) {
      debugPrint('==== fetchMobileHistory ABORTED: token=$token, deviceCode=$deviceCode ====');
      _isLoading = false;
      WidgetsBinding.instance.addPostFrameCallback((_) => notifyListeners());
      return;
    }

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/pengumumans/mobile');
      
      debugPrint('==== DEBUG API PENGUMUMAN ====');
      debugPrint('URL: $url');
      debugPrint('HEADERS: { Authorization: Bearer [REDACTED], x-device-code: $deviceCode }');

      var response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'x-device-code': deviceCode,
        },
      );

      debugPrint('RESPONSE STATUS: ${response.statusCode}');
      debugPrint('RESPONSE BODY: ${response.body}');
      debugPrint('==============================');

      if (response.statusCode == 200) {
        var result = jsonDecode(response.body);
        if (result['error'] == '' || result['status'] == true || result['status'] == 'true') {
           _listPengumuman = result['data'];
        }
      }
    } catch (e) {
      debugPrint('Error fetchMobileHistory: $e');
    }

    _isLoading = false;
    WidgetsBinding.instance.addPostFrameCallback((_) => notifyListeners());
  }

  Future<void> markAsRead(int recipientId) async {
    final secureStorage = SecureStorageHelper();
    String? token = await secureStorage.getToken();
    String? deviceCode = await secureStorage.getDeviceCode();

    if (token == null || deviceCode == null) return;

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/pengumumans/read');
      await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'x-device-code': deviceCode,
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'recipient_id': recipientId
        }),
      );

      // Refresh list locally
      int index = _listPengumuman.indexWhere((element) => element['id'] == recipientId);
      if (index != -1) {
        _listPengumuman[index]['status'] = 'Read';
        WidgetsBinding.instance.addPostFrameCallback((_) => notifyListeners());
      }
    } catch (e) {
      debugPrint('Error markAsRead: $e');
    }
  }
}


