import 'dart:convert';
import '../config/config.dart';
import '../models/model_detail_transaksi.dart';
import '../models/model_detail_transaksi_pascabayar.dart';
import '../models/model_inquiry_pascabayar.dart';
import '../models/model_list_kategori.dart';
import '../models/model_list_operator.dart';
import '../models/model_list_produk.dart';
import '../models/model_transaction.dart';
import '../models/model_void.dart';
import '../sql/SQLHelper.dart';
import '../utils/network_util.dart';

class Rest_transaction {
  String? _getPrefix_url;
  String? _getDaftarProduk_url;
  String? _getDaftarProdukData_url;
  String? _getDaftarOperator_url;
  String? _getDaftarKategori_url;

  String? _getDaftarKategoriPascabayar_url;
  String? _prabayarTransaction_url;
  String? _detailTransaksi_url;
  String? _detailTransaksiPascabayar_url;
  String? _inquiryPascabayar_url;
  String? _pembayaranPascabayar_url;
  String? _main_url;

  // constructor
  Rest_transaction() {
    final config = ConfigApp();
    _getPrefix_url = config.getPrefix_url;
    _getDaftarProduk_url = config.getDaftarProduk_url;
    _getDaftarProdukData_url = config.getDaftarProdukData_url;
    // String? _getDaftarProdukData_url;
    _getDaftarOperator_url = config.getDaftarOperator_url;
    _getDaftarKategori_url = config.getDaftarKategori_url;
    _getDaftarKategoriPascabayar_url = config.getDaftarKategoriPascabayar_url;
    _prabayarTransaction_url = config.prabayarTransaction_url;
    _detailTransaksi_url = config.detailTransaksi_url;
    _detailTransaksiPascabayar_url = config.detailTransaksiPascabayar_url;
    _inquiryPascabayar_url = config.inquiryPascabayar_url;
    _pembayaranPascabayar_url = config.pembayaranPascabayar_url;
    _main_url = config.mainUrl;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_void> getPrefix(String nomorTujuan, String kodeKategori) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getPrefix_url!);

    return _netUtil
        .post(url, headers,
            jsonEncode({"nomor_tujuan": nomorTujuan, "kode": kodeKategori}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_list_operator> getDaftarOperator(
      String nomorTujuan, String kodeKategori, bool prefix) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getDaftarOperator_url!);

    print("-----------url");
    print(url);
    print("-----------url");

    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "nomor_tujuan": nomorTujuan,
              "kode": kodeKategori,
              "prefixStatus": prefix
            }))
        .then((dynamic res) async {
      print("-----------res");
      print(res);
      print("-----------res");
      return new Model_list_operator.map(res);
    });
  }

  Future<Model_list_produk> getDaftarProduk(
      String nomorTujuan, String kodeKategori, bool prefix) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _getDaftarProduk_url!);

    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "nomor_tujuan": nomorTujuan,
              "kode": kodeKategori,
              "prefixStatus": prefix
            }))
        .then((dynamic res) async {
      return new Model_list_produk.map(res);
    });
  }

  Future<Model_list_produk> getDaftarProdukData(
      String id, String kode, String name, String nomor_tujuan) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_main_url! + '/${kode}' + _getDaftarProdukData_url!);

    print("-----------url");
    print(url);
    print("-----------url");
    print(token);
    print(id);
    print(kode);
    print(name);
    print(nomor_tujuan);

    return _netUtil
        .post(
            url,
            headers,
            jsonEncode({
              "id": id,
              "nomor_tujuan": nomor_tujuan,
              "kode": kode,
              "name": name,
            }))
        .then((dynamic res) async {
      print("-----------res");
      print(res);
      print("-----------res");
      return new Model_list_produk.map(res);
    });
  }

  //

  Future<Model_list_kategori> getDaftarKategori(String kodeKategori) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url = Uri.parse(_main_url! + '/${kode}' + _getDaftarKategori_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode": kodeKategori}))
        .then((dynamic res) async {
      print("============res");
      print(res);
      print("============res");
      return new Model_list_kategori.map(res);
    });
  }

  Future<Model_list_kategori> getDaftarKategoriPascabayar(
      String kodeKategori) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _getDaftarKategoriPascabayar_url!);

    print("++++++++++++++url");
    print(url);
    print("++++++++++++++url");
    return _netUtil
        .post(url, headers, jsonEncode({"kode": kodeKategori}))
        .then((dynamic res) async {
      print("============res");
      print(res);
      print("============res");
      return new Model_list_kategori.map(res);
    });
  }

  Future<Model_transaction> prabayarTransaction(
      String nomor_tujuan, String kode_produk) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];
    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _prabayarTransaction_url!);

    print("=========REST PRABAYAR TRANSACTION");
    print(nomor_tujuan);
    print(kode_produk);
    print(url);
    print(headers);
    print("=========REST PRABAYAR TRANSACTION");

    return _netUtil
        .post(
            url,
            headers,
            jsonEncode(
                {"nomor_tujuan": nomor_tujuan, "kode_produk": kode_produk}))
        .then((dynamic res) async {
      print("============FEEDBACK REST PRABAYAR TRANSACTION");
      print(res);
      print("============FEEDBACK REST PRABAYAR TRANSACTION");
      return new Model_transaction.map(res);
    });
  }

  Future<Model_detail_transaksi> detailTransaksi(String kode_transaksi) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _detailTransaksi_url!);
    print("=========REST detail TRANSACTION");
    print(kode_transaksi);
    print(token);
    print(kode);
    print(headers);
    print(url);
    print("=========REST detail TRANSACTION");
    return _netUtil
        .post(url, headers, jsonEncode({"kode_transaksi": kode_transaksi}))
        .then((dynamic res) async {
      print("=========FEEDBACK detail TRANSACTION");
      print(res);
      print("=========FEEDBACK detail TRANSACTION");
      return new Model_detail_transaksi.map(res);
    });
  }

  Future<Model_inquiry_pascabayar> inquiryPascabayar(
      String product_code, String nomor_tujuan) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _inquiryPascabayar_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode(
                {"product_code": product_code, "nomor_tujuan": nomor_tujuan}))
        .then((dynamic res) async {
      return new Model_inquiry_pascabayar.map(res);
    });
  }

  Future<Model_void> pembayaranPascabayar(String trId) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url = Uri.parse(_main_url! + '/${kode}' + _pembayaranPascabayar_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"tr_id": trId}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_detail_transaksi_pascabayar> detailTransaksiPascabayar(
      String kode_transaksi) async {
    Map<String, dynamic>? dataProfils = await db.getSingleData('1');
    final token = dataProfils!['token'];
    final kode = dataProfils['kode'];

    Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };

    Uri url =
        Uri.parse(_main_url! + '/${kode}' + _detailTransaksiPascabayar_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode_transaksi": kode_transaksi}))
        .then((dynamic res) async {
      print("=========FEEDBACK detail TRANSACTION");
      print(res);
      print("=========FEEDBACK detail TRANSACTION");
      return new Model_detail_transaksi_pascabayar.map(res);
    });
  }
}
