import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';

/// Mengelola idempotency key untuk niat topup LinkQu.
///
/// - Satu key untuk satu intent (nominal + metode + bank); disimpan per-slot sehingga
///   mengganti metode/nominal tidak menimpa key intent lain.
/// - Masa simpan disamakan dengan masa berlaku tagihan (2 jam) plus margin, agar retry
///   dalam masa berlaku tetap memakai key yang sama dan tidak membuat tagihan kedua.
/// - Key dihapus hanya untuk intent yang benar-benar selesai, bukan seluruh slot.
class DepositIdempotency {
  static const _storeKey = 'deposit_linkqu_idempotency_slots';

  /// Tagihan dibuat dengan masa berlaku 2 jam; beri margin agar retry masih dalam masa berlaku.
  static const _maxAge = Duration(hours: 3);

  static String buildIntent(int nominal, String paymentMethod, String? bankCode) {
    final method = paymentMethod.toUpperCase();
    final bank = (bankCode ?? '').toUpperCase();
    return '$nominal|$method|$bank';
  }

  /// Mengembalikan key yang sudah ada untuk intent yang sama, atau membuat key baru.
  static Future<String> getOrCreate({
    required int nominal,
    required String paymentMethod,
    String? bankCode,
  }) async {
    final intent = buildIntent(nominal, paymentMethod, bankCode);
    final nowMs = DateTime.now().millisecondsSinceEpoch;
    final slots = await _readSlots();

    _pruneExpired(slots, nowMs);

    final existingKey = slots[intent]?['key']?.toString();
    if (existingKey != null && existingKey.isNotEmpty) {
      await _writeSlots(slots);
      return existingKey;
    }

    final newKey = _generateKey(nowMs);
    slots[intent] = {'key': newKey, 'createdAt': nowMs};
    await _writeSlots(slots);
    return newKey;
  }

  /// Menghapus key hanya untuk intent ini setelah statusnya terminal.
  /// Bila [knownKey] diberikan, slot hanya dihapus ketika key tersimpan sama,
  /// sehingga transaksi lama tidak menghapus key transaksi baru.
  static Future<void> clear({
    required int nominal,
    required String paymentMethod,
    String? bankCode,
    String? knownKey,
  }) async {
    final intent = buildIntent(nominal, paymentMethod, bankCode);
    final slots = await _readSlots();
    final storedKey = slots[intent]?['key']?.toString();
    if (storedKey == null) return;
    if (knownKey != null && storedKey != knownKey) return;
    slots.remove(intent);
    await _writeSlots(slots);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storeKey);
  }

  static void _pruneExpired(Map<String, Map<String, dynamic>> slots, int nowMs) {
    slots.removeWhere((_, value) {
      final createdAt = (value['createdAt'] as num?)?.toInt() ?? 0;
      return createdAt <= 0 || (nowMs - createdAt) > _maxAge.inMilliseconds;
    });
  }

  static Future<Map<String, Map<String, dynamic>>> _readSlots() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storeKey);
    if (raw == null || raw.isEmpty) return {};

    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map) {
        final result = <String, Map<String, dynamic>>{};
        decoded.forEach((key, value) {
          if (value is Map) {
            result[key.toString()] = Map<String, dynamic>.from(value);
          }
        });
        return result;
      }
    } catch (_) {
      // Data rusak diabaikan; key baru akan dibuat.
    }
    return {};
  }

  static Future<void> _writeSlots(Map<String, Map<String, dynamic>> slots) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storeKey, jsonEncode(slots));
  }

  static String _generateKey(int nowMs) {
    final rand = Random.secure();
    final randomPart = rand.nextInt(1 << 32).toRadixString(16);
    return 'topup-$nowMs-$randomPart';
  }
}
