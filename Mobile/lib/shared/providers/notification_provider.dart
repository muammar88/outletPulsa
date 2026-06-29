import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import '../../core/constants/config.dart';
import 'package:flutter/foundation.dart';

class NotificationProvider extends ChangeNotifier {
  FirebaseMessaging? _firebaseMessaging;
  
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  List<dynamic> _listNotification = [];
  List<dynamic> get listNotification => _listNotification;

  Future<void> initNotification() async {
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
          debugPrint('Message also contained a notification: ${message.notification}');
          // You could show a local snackbar or flushbar here if desired.
          // Or just fetch the latest notifications
          fetchMobileHistory();
        }
      });

      // Handle when app is opened from a terminated state
      FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
        if (message != null) {
          debugPrint('Opened from terminated state with message: ${message.data}');
          // Handle navigation or logic here
        }
      });

      // Handle when app is opened from background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('Opened from background state with message: ${message.data}');
        // Handle navigation or logic here
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

    } catch (e) {
      debugPrint('Error init notification: $e');
    }
  }

  Future<void> updateFcmToken(String fcmToken) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    String? deviceCode = prefs.getString('device_code');

    if (token == null || deviceCode == null) return;

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/notifications/fcm-token');
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
    _isLoading = true;
    notifyListeners();

    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    String? deviceCode = prefs.getString('device_code');

    if (token == null || deviceCode == null) {
      _isLoading = false;
      notifyListeners();
      return;
    }

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/notifications/mobile');
      var response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'x-device-code': deviceCode,
        },
      );

      if (response.statusCode == 200) {
        var result = jsonDecode(response.body);
        if (result['status'] == true) {
           _listNotification = result['data'];
        }
      }
    } catch (e) {
      debugPrint('Error fetchMobileHistory: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> markAsRead(int recipientId) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    String? deviceCode = prefs.getString('device_code');

    if (token == null || deviceCode == null) return;

    try {
      ConfigApp config = ConfigApp();
      var url = Uri.parse('${config.mainUrl}/notifications/read');
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
      int index = _listNotification.indexWhere((element) => element['id'] == recipientId);
      if (index != -1) {
        _listNotification[index]['status'] = 'Read';
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error markAsRead: $e');
    }
  }
}
