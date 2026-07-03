import 'dart:async';
import 'package:flutter/foundation.dart';
import '../core/socket/socket_service.dart';

class RealtimeNotifier extends ChangeNotifier {
  final SocketService _socketService = SocketService();
  
  // Subscriptions to cancel them on dispose
  StreamSubscription? _txSub;
  StreamSubscription? _balanceSub;
  StreamSubscription? _announcementSub;
  StreamSubscription? _ticketSub;
  StreamSubscription? _chatSub;

  // Realtime States
  Map<String, dynamic>? lastTransaction;
  double? currentBalance;
  bool hasNewAnnouncement = false;
  Map<String, dynamic>? lastAnnouncement;
  Map<String, dynamic>? lastTicketUpdate;
  List<Map<String, dynamic>> unreadMessages = [];

  RealtimeNotifier() {
    _initSubscriptions();
  }

  void _initSubscriptions() {
    _txSub = _socketService.onTransactionUpdated.listen((data) {
      lastTransaction = data;
      // Notify listeners so UI (like Transaction History or SnackBar) can react
      notifyListeners();
    });

    _balanceSub = _socketService.onBalanceUpdated.listen((data) {
      if (data['newBalance'] != null) {
        currentBalance = double.tryParse(data['newBalance'].toString());
        // All widgets showing balance will rebuild automatically
        notifyListeners();
      }
    });

    _announcementSub = _socketService.onAnnouncement.listen((data) {
      hasNewAnnouncement = true;
      lastAnnouncement = data;
      notifyListeners();
    });

    _ticketSub = _socketService.onTicketUpdated.listen((data) {
      lastTicketUpdate = data;
      notifyListeners();
    });

    _chatSub = _socketService.onChatMessage.listen((data) {
      unreadMessages.add(data);
      notifyListeners();
    });
  }

  /// Mark announcements as read
  void clearAnnouncementBadge() {
    if (hasNewAnnouncement) {
      hasNewAnnouncement = false;
      notifyListeners();
    }
  }

  /// Mark chat as read
  void clearUnreadMessages() {
    if (unreadMessages.isNotEmpty) {
      unreadMessages.clear();
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _txSub?.cancel();
    _balanceSub?.cancel();
    _announcementSub?.cancel();
    _ticketSub?.cancel();
    _chatSub?.cancel();
    super.dispose();
  }
}
