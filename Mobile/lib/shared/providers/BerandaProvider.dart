import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:outletpulsa/services/beranda.dart';
import 'package:outletpulsa/models/model_beranda.dart';

class Beranda_provider with ChangeNotifier {
  bool isLogin = false;

  void updateIsLogin(bool value) {
    isLogin = value;
    notifyListeners();
  }

  String? _name;
  String? _nomor_whatsapp;
  String? _saldo;
  String? _kode;
  bool? _status_deposit;
  String? _kode_agen;
  // String? _status_kirim;

  String? get name => _name ?? 'Tidak ada nama';
  String? get nomor_whatsapp => _nomor_whatsapp ?? 'Tidak ada nomor whatsapp';
  String? get saldo => _saldo ?? 'Rp 0,-';
  String? get kode => _kode ?? '-';
  bool? get status_deposit => _status_deposit ?? false;
  String? get kode_agen => _kode_agen;

  bool get isAgen {
    return _kode_agen == null || _kode_agen!.isEmpty;
  }
  // String? get status_kirim => _status_kirim;

  set name(String? value) {
    _name = value;
    notifyListeners();
  }

  set nomor_whatsapp(String? value) {
    _nomor_whatsapp = value;
    notifyListeners();
  }

  set saldo(String? value) {
    _saldo = value;
    notifyListeners();
  }

  set kode(String? value) {
    _kode = value;
    notifyListeners();
  }

  Future<void> get_data_beranda() async {
    await Rest_beranda().Rest_data_beranda().then((Model_beranda e) async {
      if (e.error == false) {
        _name = e.name;
        _nomor_whatsapp = e.nomor_whatsapp;
        _saldo = e.saldo;
        _kode = e.kode;
        _status_deposit = e.status_deposit;
        _kode_agen = e.kode_agen;
        // _status_kirim = e.status_kirim;

        notifyListeners();
      } else {
        final sharedPref = await SharedPreferences.getInstance();
        sharedPref.clear();
        updateIsLogin(false);
      }
    });
  }
}
