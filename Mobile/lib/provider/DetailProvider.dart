import 'package:flutter/material.dart';
import 'package:outletpulsa/services/transaction.dart';
import 'package:outletpulsa/models/model_detail_transaksi.dart';

class Detail_provider with ChangeNotifier {
  bool? _error;
  String? _errorMsg;
  String? _type;
  bool? _printStatus;
  String? _printTanggal;
  String? _printWaktu;
  String? _idPelanggan;
  String? _printNama;
  String? _printNominal;
  String? _printJmlKwh;
  String? _printToken;
  String? _printTarifDaya;

  String? _status;
  String? _productName;
  String? _dateTransaction;
  String? _nomorTujuan;
  String? _price;
  String? _serialNumber;
  String? _message;

  bool? get error => _error;
  String? get errorMsg => _errorMsg;
  String? get type => _type;
  bool? get printStatus => _printStatus;

  String? get printTanggal => _printTanggal;
  String? get printWaktu => _printWaktu;
  String? get idPelanggan => _idPelanggan;
  String? get printNama => _printNama;
  String? get printNominal => _printNominal;
  String? get printJmlKwh => _printJmlKwh;
  String? get printToken => _printToken;
  String? get printTarifDaya => _printTarifDaya;

  String? get status => _status;

  String? get productName => _productName;
  String? get dateTransaction => _dateTransaction;
  String? get nomorTujuan => _nomorTujuan;
  String? get price => _price;
  String? get serialNumber => _serialNumber;
  String? get message => _message;

  Future<void> detailTransaksi(String kode_transaksi) async {
    print("--------1");
    print(kode_transaksi);
    print("--------1");
    await Rest_transaction()
        .detailTransaksi(kode_transaksi)
        .then((Model_detail_transaksi e) async {
      print("+++++++++++++++1");
      print(e.status);
      print(e.type);
      print("+++++++++++++++1");

      _error = e.error;
      _errorMsg = e.errorMsg;
      _status = e.status;
      _type = e.type;
      _printStatus = e.printStatus;
      _printTanggal = e.printTanggal;
      _printWaktu = e.printWaktu;
      _idPelanggan = e.idPelanggan;
      _printNama = e.printNama;
      _printNominal = e.printNominal;
      _printJmlKwh = e.printJmlKwh;
      _printToken = e.printToken;
      _printTarifDaya = e.printTarifDaya;
      _productName = e.productName;
      _dateTransaction = e.dateTransaction;
      _nomorTujuan = e.nomorTujuan;
      _price = e.price;
      _serialNumber = e.serialNumber;
      _message = e.message;
      notifyListeners();
    });
  }
}
