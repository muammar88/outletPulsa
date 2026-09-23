import 'package:flutter/material.dart';
import 'package:outletpulsa/services/transaction.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/models/model_inquiry_pascabayar.dart';
import 'package:outletpulsa/models/model_list_kategori.dart';
import 'package:outletpulsa/models/model_list_operator.dart';
import 'package:outletpulsa/models/model_list_produk.dart';
import 'package:outletpulsa/models/model_transaction.dart';
import 'package:outletpulsa/models/model_prefix.dart';

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
  String? _operatorName;
  String? get operatorCode => _operatorCode;
  String? get operatorName => _operatorName;
  List<String>? _operators;
  List<Map<String, dynamic>>? _operatorsData;
  List<String>? get operators => _operators;
  List<Map<String, dynamic>>? get operatorsData => _operatorsData;

  int _currentPage = 1;
  bool _hasNextPage = true;
  bool _isLoadingNextPage = false;
  final int _limit = 20;
  
  int get currentPage => _currentPage;
  bool get hasNextPage => _hasNextPage;
  bool get isLoadingNextPage => _isLoadingNextPage;

  void resetListOperator() {
    _list_operator = null;
    _error = null;
    _errorMsg = null;
    // Tidak perlu notifyListeners() — method ini hanya untuk cleanup saat dispose.
    // Screen baru akan mendapat notifikasi dari getDaftarOperator() yang sudah
    // memanggil notifyListeners() sendiri di awal fetch.
  }

  void resetListProduk() {
    _list_produk = null;
    _error = null;
    _errorMsg = null;
    _currentPage = 1;
    _hasNextPage = true;
    _isLoadingNextPage = false;
    // Tidak perlu notifyListeners() — lihat penjelasan resetListOperator().
  }

  void resetListKategori() {
    _list_kategori = null;
    _error = null;
    _errorMsg = null;
    // Tidak perlu notifyListeners() — lihat penjelasan resetListOperator().
  }

  void resetListKategoriPascabayar() {
    _list_kategori_pascabayar = null;
    _error = null;
    _errorMsg = null;
    // Tidak perlu notifyListeners() — lihat penjelasan resetListOperator().
  }

  Future<void> getPrefix(String nomorTujuan, String kode) async {
    await Rest_transaction()
        .getPrefix(nomorTujuan, kode)
        .then((Model_prefix e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      _operatorCode = e.operatorCode;
      _operatorName = e.operatorName;
      _operators = e.operators;
      _operatorsData = e.operatorsData;
      notifyListeners();
    });
  }

  Future<void> getDaftarOperator(
      String nomorTujuan, String path, bool prefix) async {
    // Reset sebelum fetch agar UI langsung tampil skeleton bukan data lama
    _list_operator = null;
    _error = null;
    _errorMsg = null;
    notifyListeners();

    await Rest_transaction()
        .getDaftarOperator(nomorTujuan, path, prefix)
        .then((Model_list_operator e) async {
      _list_operator = e.list_operator ?? {};
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    }).catchError((err) {
      _list_operator = {};
      _error = true;
      _errorMsg = err.toString().replaceAll('Exception: ', '');
      notifyListeners();
    });
  }

  Future<void> getDaftarProduk({
    String? search,
    String? kategori,
    String? operator,
    bool isLoadMore = false,
  }) async {
    if (isLoadMore) {
      if (!_hasNextPage || _isLoadingNextPage) return;
      _isLoadingNextPage = true;
      _currentPage++;
      notifyListeners();
    } else {
      _currentPage = 1;
      _hasNextPage = true;
      _isLoadingNextPage = false;
      _error = null;
      _errorMsg = null;
      _list_produk = null;
      Future.microtask(() => notifyListeners());
    }

    await Rest_transaction()
        .getDaftarProduk(
      search: search,
      kategori: kategori,
      operator: operator,
      page: _currentPage,
      limit: _limit,
    )
        .then((Model_list_produk e) async {
      
      if (isLoadMore && _list_produk != null && e.list_produk != null) {
        int currentLength = _list_produk!.length;
        int i = 0;
        e.list_produk!.forEach((key, value) {
          _list_produk![(currentLength + i).toString()] = value;
          i++;
        });
        if (e.list_produk!.isEmpty || e.list_produk!.length < _limit) {
          _hasNextPage = false;
        }
      } else {
        _list_produk = e.list_produk;
        if (e.list_produk == null || e.list_produk!.isEmpty || e.list_produk!.length < _limit) {
          _hasNextPage = false;
        }
      }

      if (isLoadMore) {
        _isLoadingNextPage = false;
      }
      
      _error = e.error;
      _errorMsg = e.errorMsg;

      notifyListeners();
    }).catchError((e) {
      if (isLoadMore) {
        _isLoadingNextPage = false;
        _currentPage--; // Revert page
      } else {
        _error = true;
        _errorMsg = e.toString().replaceAll('Exception: ', '');
      }
      notifyListeners();
    });
  }

  Future<void> getDaftarProdukData(
      String id, String kode, String name, String nomor_tujuan) async {
    // Reset sebelum fetch agar UI langsung tampil skeleton bukan data lama
    _list_produk = null;
    _error = null;
    _errorMsg = null;
    notifyListeners();

    await Rest_transaction()
        .getDaftarProdukData(id, kode, name, nomor_tujuan)
        .then((Model_list_produk e) async {
      // Always assign (even if empty) so UI exits skeleton loop
      _list_produk = e.list_produk ?? {};
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    }).catchError((err) {
      _list_produk = {};
      _error = true;
      _errorMsg = err.toString().replaceAll('Exception: ', '');
      notifyListeners();
    });
  }

  Future<void> getDaftarKategori(String path, {String search = ''}) async {
    // Reset sebelum fetch agar UI langsung tampil skeleton bukan data lama
    _list_kategori = null;
    _error = null;
    _errorMsg = null;
    notifyListeners();

    await Rest_transaction()
        .getDaftarKategori(path, search: search)
        .then((Model_list_kategori e) async {
      _list_kategori = e.list_kategori ?? {};
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    }).catchError((err) {
      _list_kategori = {};
      _error = true;
      _errorMsg = err.toString().replaceAll('Exception: ', '');
      notifyListeners();
    });
  }

  Future<void> getDaftarKategoriPascabayar(String path, {String search = ''}) async {
    // Reset sebelum fetch agar UI langsung tampil skeleton bukan data lama
    _list_kategori_pascabayar = null;
    _error = null;
    _errorMsg = null;
    notifyListeners();

    await Rest_transaction()
        .getDaftarKategoriPascabayar(path, search: search)
        .then((Model_list_kategori e) async {
      _list_kategori_pascabayar = e.list_kategori ?? {};
      _error = e.error;
      _errorMsg = e.errorMsg;
      notifyListeners();
    }).catchError((err) {
      _list_kategori_pascabayar = {};
      _error = true;
      _errorMsg = err.toString().replaceAll('Exception: ', '');
      notifyListeners();
    });
  }

  Future<void> emptyListKategori() async {
    _list_kategori = null;
    notifyListeners();
  }

  Future<Model_transaction> prabayarTransaction(
      String nomor_tujuan, String kode_produk, {String? idempotency_key}) async {
    return await Rest_transaction()
        .prabayarTransaction(nomor_tujuan, kode_produk,
            idempotency_key: idempotency_key)
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
