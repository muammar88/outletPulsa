import 'package:flutter/material.dart';
import 'package:outletpulsa/services/transaction.dart';
import 'package:outletpulsa/models/model_void.dart';
import '../models/model_inquiry_pascabayar.dart';
import '../models/model_list_kategori.dart';
import '../models/model_list_operator.dart';
import '../models/model_list_produk.dart';
import '../models/model_transaction.dart';
import '../models/model_prefix.dart';

class Transaction_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  Map<String, dynamic>? _list_produk;
  Map<String, dynamic>? _list_operator;
  Map<String, dynamic>? _list_kategori;
  Map<String, dynamic>? _list_kategori_pascabayar;
  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  Map<String, dynamic>? get list_produk => _list_produk;
  Map<String, dynamic>? get list_operator => _list_operator;
  Map<String, dynamic>? get list_kategori => _list_kategori;
  Map<String, dynamic>? get list_kategori_pascabayar =>
      _list_kategori_pascabayar;
  String? _operatorCode;
  String? get operatorCode => _operatorCode;

  Future<void> getPrefix(String nomorTujuan, String kode) async {
    await Rest_transaction()
        .getPrefix(nomorTujuan, kode)
        .then((Model_prefix e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      _operatorCode = e.operatorCode;
      notifyListeners();
    });
  }

  Future<void> getDaftarOperator(
      String nomorTujuan, String path, bool prefix) async {
    await Rest_transaction()
        .getDaftarOperator(nomorTujuan, path, prefix)
        .then((Model_list_operator e) async {
      if (e.error == false) {
        _list_operator = e.list_operator;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> getDaftarProduk({
    String? search,
    String? kategori,
    String? operator,
  }) async {
    _error = null;
    _errorMsg = null;
    _list_produk = null;
    Future.microtask(() => notifyListeners());

    await Rest_transaction()
        .getDaftarProduk(
      search: search,
      kategori: kategori,
      operator: operator,
    )
        .then((Model_list_produk e) async {
      print("11111********______________");
      print(e);
      print("11111********______________");

      _list_produk = e.list_produk;
      _error = e.error;
      _errorMsg = e.errorMsg;

      notifyListeners();
    }).catchError((e) {
      print("22222********______________");
      print(e);
      print("22222********______________");

      _error = true;
      _errorMsg = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    });
  }

  Future<void> getDaftarProdukData(
      String id, String kode, String name, String nomor_tujuan) async {
    await Rest_transaction()
        .getDaftarProdukData(id, kode, name, nomor_tujuan)
        .then((Model_list_produk e) async {
      if (e.error == false) {
        _list_produk = e.list_produk;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;

      notifyListeners();
    });
  }

  Future<void> getDaftarKategori(String path) async {
    await Rest_transaction()
        .getDaftarKategori(path)
        .then((Model_list_kategori e) async {
      if (e.error == false) {
        _list_kategori = e.list_kategori;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> getDaftarKategoriPascabayar(String path) async {
    await Rest_transaction()
        .getDaftarKategoriPascabayar(path)
        .then((Model_list_kategori e) async {
      if (e.error == false) {
        _list_kategori_pascabayar = e.list_kategori;
      }
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    });
  }

  Future<void> emptyListKategori() async {
    _list_kategori = null;
    notifyListeners();
  }

  Future<Model_transaction> prabayarTransaction(
      String nomor_tujuan, String kode_produk) async {
    return await Rest_transaction()
        .prabayarTransaction(nomor_tujuan, kode_produk)
        .then((Model_transaction e) async {
      if (e.error == false) {
        return new Model_transaction.map({
          'error': false,
          'error_msg': e.errorMsg,
          'kodeTransaksi': e.kodeTransaksi
        });
      } else {
        return new Model_transaction.map({
          'error': true,
          'error_msg': e.errorMsg,
          'kodeTransaksi': e.kodeTransaksi
        });
      }
    });
  }

  Future<Model_inquiry_pascabayar> inquiryPascabayar(
      String product_code, String nomor_tujuan) async {
    return await Rest_transaction()
        .inquiryPascabayar(product_code, nomor_tujuan)
        .then((Model_inquiry_pascabayar e) async {
      return e;
    });
  }

  Future<Model_void> pembayaranPascabayar(String trId) async {
    return await Rest_transaction()
        .pembayaranPascabayar(trId)
        .then((Model_void e) async {
      return e;
    });
  }
}
