import 'package:flutter/material.dart';
import 'package:outletpulsa/services/deposit.dart';
import 'package:outletpulsa/models/model_info_deposit.dart';

class Banks {
  String? id;
  String? name;

  Banks(this.id, this.name);

  @override
  String toString() {
    return '{ ${this.id} ,${this.name} }';
  }
}

// Beranda_provider
class Info_add_deposit_provider with ChangeNotifier {
  List<dynamic>? _list_tiket;
  Map<String, dynamic>? _list_bank;
  List<dynamic>? _list_select_bank;
  String? _pesan;

  List<dynamic>? get list_tiket => _list_tiket;
  Map<String, dynamic>? get list_bank => _list_bank;
  List<dynamic>? get list_select_bank => _list_select_bank;
  String? get pesan => _pesan;

  Future<void> get_info_add_deposit() async {
    await Rest_deposit().Rest_info_deposit().then((Model_info_deposit e) async {
      if (e.error == false) {
        _list_tiket = e.list_tiket;
        _list_bank = e.list_bank;
        _list_select_bank = e.list_select_bank;
        _pesan = e.pesan;

        notifyListeners();
      }
    });
  }
}
