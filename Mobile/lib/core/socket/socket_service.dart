import 'dart:async';
import 'dart:developer';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'socket_events.dart';

class SocketService {
  // Singleton Pattern
  static final SocketService _instance = SocketService._internal();
  
  factory SocketService() {
    return _instance;
  }
  
  SocketService._internal();

  IO.Socket? _socket;
  
  // Stream controllers to broadcast events to listeners (e.g. RealtimeNotifier)
  final _transactionController = StreamController<Map<String, dynamic>>.broadcast();
  final _balanceController = StreamController<Map<String, dynamic>>.broadcast();
  final _announcementController = StreamController<Map<String, dynamic>>.broadcast();
  final _ticketController = StreamController<Map<String, dynamic>>.broadcast();
  final _chatController = StreamController<Map<String, dynamic>>.broadcast();

  // Getters for streams
  Stream<Map<String, dynamic>> get onTransactionUpdated => _transactionController.stream;
  Stream<Map<String, dynamic>> get onBalanceUpdated => _balanceController.stream;
  Stream<Map<String, dynamic>> get onAnnouncement => _announcementController.stream;
  Stream<Map<String, dynamic>> get onTicketUpdated => _ticketController.stream;
  Stream<Map<String, dynamic>> get onChatMessage => _chatController.stream;

  bool get isConnected => _socket?.connected ?? false;

  /// Connect to the socket server
  /// Call this when the user successfully logs in and you have the token.
  void connect(String url, String token) {
    if (_socket != null && _socket!.connected) {
      log('Socket is already connected.', name: 'SocketService');
      return;
    }

    log('Connecting to Socket.IO at $url', name: 'SocketService');

    _socket = IO.io(url, IO.OptionBuilder()
      .setTransports(['websocket']) // Use WebSocket only for better performance
      .disableAutoConnect() // We connect manually
      .setAuth({'token': token}) // Send token on handshake
      .enableReconnection()
      .setReconnectionAttempts(double.maxFinite.toInt())
      .setReconnectionDelay(2000)
      .build()
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      log('Connected to socket server. Client ID: ${_socket!.id}', name: 'SocketService');
    });

    _socket!.onDisconnect((_) {
      log('Disconnected from socket server', name: 'SocketService');
    });

    _socket!.onConnectError((err) {
      log('Connect Error: $err', name: 'SocketService');
    });

    _socket!.onError((err) {
      log('Error: $err', name: 'SocketService');
    });

    // Listen to business events
    _socket!.on(SocketEvents.transactionUpdated, (data) {
      log('Received transaction_updated: $data', name: 'SocketService');
      if (data is Map) _transactionController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on(SocketEvents.balanceUpdated, (data) {
      log('Received balance_updated: $data', name: 'SocketService');
      if (data is Map) _balanceController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on(SocketEvents.announcement, (data) {
      log('Received announcement: $data', name: 'SocketService');
      if (data is Map) _announcementController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on(SocketEvents.ticketUpdated, (data) {
      log('Received ticket_updated: $data', name: 'SocketService');
      if (data is Map) _ticketController.add(Map<String, dynamic>.from(data));
    });

    _socket!.on(SocketEvents.chatMessage, (data) {
      log('Received chat_message: $data', name: 'SocketService');
      if (data is Map) _chatController.add(Map<String, dynamic>.from(data));
    });
  }

  /// Disconnect from the socket server
  /// Call this when the user logs out.
  void disconnect() {
    if (_socket != null) {
      log('Disconnecting from socket server', name: 'SocketService');
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }
  }

  /// Close streams (useful for app teardown)
  void dispose() {
    disconnect();
    _transactionController.close();
    _balanceController.close();
    _announcementController.close();
    _ticketController.close();
    _chatController.close();
  }
}
