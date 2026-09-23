import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:outletpulsa/models/model_detail_deposit.dart';
import 'package:outletpulsa/module/member/widget/beranda/deposit/payment_instruction_screen.dart';

void main() {
  group('ISSUE-007: Deposit Integration & PaymentInstructionScreen Tests', () {
    test('Model_detail_deposit correctly parses payment_gateway data', () {
      final mockResponse = {
        'error': false,
        'message': 'Sukses',
        'data': {
          'list': {
            'kode': 'DEP-1001',
            'nominal': '50000',
            'bank_tujuan_transfer': 'VA (Permata)',
            'nomor_rekening_akun': '887766554433',
            'nama_akun': 'LinkQu Payment',
            'status_deposit': 'proses',
            'status_kirim': 'MENUNGGU',
            'alasan_penolakan': '-',
            'waktu_kirim': '2026-09-23T12:00:00.000Z',
            'payment_gateway': {
              'transaction_id': 'uuid-123',
              'payment_method': 'VA',
              'bank_code': '013',
              'bank_name': 'Permata',
              'virtual_account': '887766554433',
              'amount': 50000,
              'fee_admin': 2000,
              'total_amount': 52000,
              'status': 'PENDING',
              'partner_reff': 'DP-12345678',
            }
          }
        }
      };

      final model = Model_detail_deposit.map(mockResponse);
      expect(model.error, false);
      expect(model.kode, 'DEP-1001');
      expect(model.payment_gateway, isNotNull);
      expect(model.payment_gateway!['virtual_account'], '887766554433');
      expect(model.payment_gateway!['total_amount'], 52000);
      expect(model.payment_gateway!['status'], 'PENDING');
    });

    testWidgets('PaymentInstructionScreen renders VA details and amount breakdown', (WidgetTester tester) async {
      final txData = {
        'transaction_id': 'uuid-123',
        'payment_method': 'VA',
        'bank_code': '013',
        'bank_name': 'Permata',
        'virtual_account': '887766554433',
        'amount': 50000,
        'fee_admin': 2000,
        'total_amount': 52000,
        'status': 'PENDING',
        'partner_reff': 'DP-12345678',
        'expired_at': '2026-09-23T14:00:00.000Z',
      };

      await tester.pumpWidget(
        MaterialApp(
          home: PaymentInstructionScreen(transactionData: txData),
        ),
      );

      // Verify Total Tagihan is shown
      expect(find.text('Total Tagihan Pembayaran'), findsOneWidget);
      expect(find.text('887766554433'), findsOneWidget);
      expect(find.text('Bank Permata'), findsOneWidget);
      expect(find.text('Menunggu Pembayaran'), findsOneWidget);
      expect(find.text('Cek Status Pembayaran'), findsOneWidget);
      expect(find.text('Kembali ke Beranda'), findsOneWidget);
    });

    testWidgets('PaymentInstructionScreen renders QRIS text fallback when image is null', (WidgetTester tester) async {
      final txData = {
        'transaction_id': 'uuid-qris',
        'payment_method': 'QRIS',
        'amount': 25000,
        'fee_admin': 750,
        'total_amount': 25750,
        'status': 'PENDING',
        'partner_reff': 'DP-QRIS-999',
        'qris_text': '00020101021226600016ID.LINKQU.WWW0118936009143213013234580210G12345678953033605802ID5911OUTLET PULSA6007JAKARTA61051234062070703A016304ABCD',
        'imageqris': null,
      };

      await tester.pumpWidget(
        MaterialApp(
          home: PaymentInstructionScreen(transactionData: txData),
        ),
      );

      expect(find.text('Scan Kode QRIS'), findsOneWidget);
      expect(find.text('Kode QRIS Digital'), findsOneWidget);
      expect(find.text('Salin Kode QRIS'), findsOneWidget);
    });
  });
}
