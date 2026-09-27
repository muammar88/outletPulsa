import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:outletpulsa/services/deposit_idempotency.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('DepositIdempotency (ISSUE-008 F4/F6)', () {
    test('mengembalikan key yang sama untuk intent yang sama (retry jaringan)', () async {
      final first = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );
      final second = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );

      expect(first, isNotEmpty);
      expect(second, first);
    });

    test('slot terpisah: ganti metode/nominal tidak menimpa key intent lain', () async {
      final va = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );
      final qris = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'QRIS',
        bankCode: null,
      );
      final vaAgain = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );

      expect(qris, isNot(va));
      expect(vaAgain, va);
    });

    test('clear hanya menghapus intent terkait, intent lain tetap', () async {
      final va = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );
      final qris = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'QRIS',
        bankCode: null,
      );

      await DepositIdempotency.clear(nominal: 50000, paymentMethod: 'VA', bankCode: '002');

      final vaAfter = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'VA',
        bankCode: '002',
      );
      final qrisAfter = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'QRIS',
        bankCode: null,
      );

      expect(vaAfter, isNot(va));
      expect(qrisAfter, qris);
    });

    test('clearAll memaksa key baru untuk semua intent', () async {
      final before = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'QRIS',
        bankCode: null,
      );
      await DepositIdempotency.clearAll();
      final after = await DepositIdempotency.getOrCreate(
        nominal: 50000,
        paymentMethod: 'QRIS',
        bankCode: null,
      );

      expect(after, isNot(before));
    });
  });
}
