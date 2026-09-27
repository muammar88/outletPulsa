import 'package:flutter_test/flutter_test.dart';
import 'package:outletpulsa/models/model_detail_transaksi_pascabayar.dart';

void main() {
  group('Model_detail_transaksi_pascabayar', () {
    Map<String, dynamic> payload({required bool includeDaya, Object? daya}) => {
      'error': false,
      'error_msg': '',
      'data': {
        'kode': 'PSC1',
        'status': 'sukses',
        'print_status': true,
        'tanggal': '2026-09-27',
        'waktu': '10:00:00',
        'noref': 'BILLER900001',
        'sn': 'SN900001',
        'periode': '202609',
        'tarif': 'R1',
        if (includeDaya) 'daya': daya,
        'total': '102500',
        'productName': 'PLN Pascabayar',
        'nomorTujuan': '001234567890',
        'namaPelanggan': 'PELANGGAN UJI',
        'price': '100000',
        'totalPrice': '102500',
        'biayaAdmin': '2500',
        'providerAdminFee': '2500',
        'fee': '0',
        'message': '',
      },
    };

    test('daya numerik (1300) dikonversi ke string', () {
      final m = Model_detail_transaksi_pascabayar.map(payload(includeDaya: true, daya: 1300));
      expect(m.daya, '1300');
    });

    test('daya string tidak berubah', () {
      final m = Model_detail_transaksi_pascabayar.map(payload(includeDaya: true, daya: '1300'));
      expect(m.daya, '1300');
    });

    test('daya null tetap null', () {
      final m = Model_detail_transaksi_pascabayar.map(payload(includeDaya: true, daya: null));
      expect(m.daya, isNull);
    });

    test('field daya tidak ada tetap null', () {
      final m = Model_detail_transaksi_pascabayar.map(payload(includeDaya: false));
      expect(m.daya, isNull);
    });

    test('sn, periode, dan noref biller dibaca', () {
      final m = Model_detail_transaksi_pascabayar.map(payload(includeDaya: true, daya: 1300));
      expect(m.sn, 'SN900001');
      expect(m.periode, '202609');
      expect(m.noref, 'BILLER900001');
    });
  });
}
