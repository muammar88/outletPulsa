import 'package:flutter/material.dart';
import '../services/deposit.dart';
import '../models/model_info_deposit.dart';

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
  Map<String, dynamic>? _list_tiket;
  Map<String, dynamic>? _list_bank;
  List<dynamic>? _list_select_bank;
  String? _pesan;

  Map<String, dynamic>? get list_tiket => _list_tiket;
  Map<String, dynamic>? get list_bank => _list_bank;
  List<dynamic>? get list_select_bank => _list_select_bank;
  String? get pesan => _pesan;

  Future<void> get_info_add_deposit() async {
    await Rest_deposit().Rest_info_deposit().then((Model_info_deposit e) async {
      if (e.error == false) {
        var list = e.list_select_bank!.entries.map((e) {
          return e.value;
        }).toList();

        _list_tiket = e.list_tiket;
        _list_bank = e.list_bank;
        _list_select_bank = list;
        _pesan = e.pesan;

        notifyListeners();
      }
    });
  }
}
