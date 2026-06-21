import 'package:flutter/material.dart';
import 'package:outletpulsa/services/transaction.dart';
import 'package:outletpulsa/models/model_detail_transaksi_pascabayar.dart';

class Detail_pascabayar_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  String? _type;
  bool? _printStatus;
  String? _tanggal;
  String? _waktu;
  String? _noref;
  String? _tarif;
  String? _daya;
  String? _total;
  String? _status;
  String? _productName;
  String? _dateTransaction;
  String? _nomorTujuan;
  String? _namaPelanggan;
  String? _price;
  String? _totalPrice;
  String? _biayaAdmin;
  String? _fee;
  String? _message;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get type => _type;
  bool? get printStatus => _printStatus;
  String? get tanggal => _tanggal;
  String? get waktu => _waktu;
  String? get noref => _noref;
  String? get tarif => _tarif;
  String? get daya => _daya;
  String? get total => _total;
  String? get status => _status;
  String? get productName => _productName;
  String? get dateTransaction => _dateTransaction;
  String? get nomorTujuan => _nomorTujuan;
  String? get namaPelanggan => _namaPelanggan;
  String? get price => _price;
  String? get totalPrice => _totalPrice;
  String? get biayaAdmin => _biayaAdmin;
  String? get fee => _fee;
  String? get message => _message;

  Future<void> detailTransaksiPascabayar(String kode_transaksi) async {
    await Rest_transaction()
        .detailTransaksiPascabayar(kode_transaksi)
        .then((Model_detail_transaksi_pascabayar e) async {
      _error = e.error;
      _errorMsg = e.errorMsg;
      _status = e.status;
      _type = 'pascabayar';
      _printStatus = e.printStatus;
      _tanggal = e.tanggal;
      _waktu = e.waktu;
      _noref = e.noref;
      _tarif = e.tarif;
      _daya = e.daya;
      _total = e.total;
      _productName = e.productName;
      _dateTransaction = e.dateTransaction;
      _nomorTujuan = e.nomorTujuan;
      _namaPelanggan = e.namaPelanggan;
      _price = e.price;
      _totalPrice = e.totalPrice;
      _biayaAdmin = e.biayaAdmin;
      _fee = e.fee;
      _message = e.message;
      notifyListeners();
    });
  }
}
