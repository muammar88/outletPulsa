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

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_reseller => _list_reseller;
  Map<String, dynamic>? get list_riwayat_pembayaran => _list_riwayat_pembayaran;

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
}
