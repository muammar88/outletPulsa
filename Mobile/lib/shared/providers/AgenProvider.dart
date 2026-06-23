import 'package:flutter/material.dart';
import 'package:outletpulsa/services/agen.dart';
import 'package:outletpulsa/services/deposit.dart';
import 'package:outletpulsa/models/model_agen.dart';
import 'package:outletpulsa/models/model_detail_deposit.dart';
import 'package:outletpulsa/models/model_list_produk.dart';
import 'package:outletpulsa/models/model_void.dart';

class Agen_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_reseller;
  Map<String, dynamic>? _list_riwayat_pembayaran;
  Map<String, dynamic>? _list_transaksi_reseller;
  Map<String, dynamic>? _statistik;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_reseller => _list_reseller;
  Map<String, dynamic>? get list_riwayat_pembayaran => _list_riwayat_pembayaran;
  Map<String, dynamic>? get list_transaksi_reseller => _list_transaksi_reseller;
  Map<String, dynamic>? get statistik => _statistik;

  Future<void> getDaftarAgen() async {
    await Rest_agen().listAgen().then((Model_agen e) async {
      if (e.error == false) {
        _list_reseller = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> getDaftarRiwayatPembayaranFeeAgen() async {
    await Rest_agen().listRiwayatPembayaran().then((Model_agen e) async {
      if (e.error == false) {
        _list_riwayat_pembayaran = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> getTransaksiReseller() async {
    await Rest_agen().listTransaksiReseller().then((Model_agen e) async {
      if (e.error == false) {
        _list_transaksi_reseller = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> getStatistikAgen() async {
    await Rest_agen().listStatistik().then((Model_agen e) async {
      if (e.error == false) {
        _statistik = e.list;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> klaimFeeAgen() async {
    await Rest_agen().klaimFee().then((Model_agen e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      if (e.error == false) {
        // Refresh statistik jika sukses
        await getStatistikAgen();
      }
      notifyListeners();
    });
  }
}
