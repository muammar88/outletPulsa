import 'dart:convert';
import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/models/model_detail_transaksi.dart';
import 'package:outletpulsa/models/model_detail_transaksi_pascabayar.dart';
import 'package:outletpulsa/models/model_inquiry_pascabayar.dart';
import 'package:outletpulsa/models/model_list_kategori.dart';
import 'package:outletpulsa/models/model_list_operator.dart';
import 'package:outletpulsa/models/model_list_produk.dart';
import 'package:outletpulsa/models/model_transaction.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/sql/SQLHelper.dart';
import 'package:outletpulsa/utils/network_util.dart';
import 'api_headers.dart';

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

  // constructor
  Rest_transaction() {
    final config = ConfigApp();
    _getPrefix_url = config.getPrefix_url;
    _getDaftarProduk_url = config.getDaftarProduk_url;
    _getDaftarProdukData_url = config.getDaftarProdukData_url;
    _getDaftarOperator_url = config.getDaftarOperator_url;
    _getDaftarKategori_url = config.getDaftarKategori_url;
    _getDaftarKategoriPascabayar_url = config.getDaftarKategoriPascabayar_url;
    _prabayarTransaction_url = config.prabayarTransaction_url;
    _detailTransaksi_url = config.detailTransaksi_url;
    _detailTransaksiPascabayar_url = config.detailTransaksiPascabayar_url;
    _inquiryPascabayar_url = config.inquiryPascabayar_url;
    _pembayaranPascabayar_url = config.pembayaranPascabayar_url;
  }

  final NetworkUtil _netUtil = NetworkUtil();
  final db = SQLHelper();

  Future<Model_void> getPrefix(String nomorTujuan, String kodeKategori) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getPrefix_url!);
    return _netUtil
        .post(url, headers,
            jsonEncode({"nomor_tujuan": nomorTujuan, "kode": kodeKategori}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_list_operator> getDaftarOperator(
      String nomorTujuan, String kodeKategori, bool prefix) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getDaftarOperator_url!);
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
      return new Model_list_operator.map(res);
    });
  }

  Future<Model_list_produk> getDaftarProduk({
    String? search,
    String? kategori,
    String? operator,
    int page = 1,
    int limit = 20,
  }) async {
    final headers = await ApiHeaders.getHeaders();
    final queryParams = {
      if (search != null) 'search': search,
      if (kategori != null) 'kategori': kategori,
      if (operator != null) 'operator': operator,
      'page': page.toString(),
      'limit': limit.toString(),
    };
    Uri url =
        Uri.parse(_getDaftarProduk_url!).replace(queryParameters: queryParams);

    print("++++++++++++++++++++++++++++++url");
    print(url);
    print("++++++++++++++++++++++++++++++url");

    return _netUtil.get(url, headers).then((dynamic res) async {
      return new Model_list_produk.map(res);
    });
  }

  Future<Model_list_produk> getDaftarProdukData(
      String id, String kode, String name, String nomor_tujuan) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getDaftarProdukData_url!);
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
      return new Model_list_produk.map(res);
    });
  }

  Future<Model_list_kategori> getDaftarKategori(String kodeKategori) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getDaftarKategori_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode": kodeKategori}))
        .then((dynamic res) async {
      return new Model_list_kategori.map(res);
    });
  }

  Future<Model_list_kategori> getDaftarKategoriPascabayar(
      String kodeKategori) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_getDaftarKategoriPascabayar_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode": kodeKategori}))
        .then((dynamic res) async {
      return new Model_list_kategori.map(res);
    });
  }

  Future<Model_transaction> prabayarTransaction(
      String nomor_tujuan, String kode_produk) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_prabayarTransaction_url!);
    return _netUtil
        .post(
            url,
            headers,
            jsonEncode(
                {"nomor_tujuan": nomor_tujuan, "kode_produk": kode_produk}))
        .then((dynamic res) async {
      return new Model_transaction.map(res);
    });
  }

  Future<Model_detail_transaksi> detailTransaksi(String kode_transaksi) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_detailTransaksi_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode_transaksi": kode_transaksi}))
        .then((dynamic res) async {
      return new Model_detail_transaksi.map(res);
    });
  }

  Future<Model_inquiry_pascabayar> inquiryPascabayar(
      String product_code, String nomor_tujuan) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_inquiryPascabayar_url!);
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
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_pembayaranPascabayar_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"tr_id": trId}))
        .then((dynamic res) async {
      return new Model_void.map(res);
    });
  }

  Future<Model_detail_transaksi_pascabayar> detailTransaksiPascabayar(
      String kode_transaksi) async {
    final headers = await ApiHeaders.getHeaders();
    Uri url = Uri.parse(_detailTransaksiPascabayar_url!);
    return _netUtil
        .post(url, headers, jsonEncode({"kode_transaksi": kode_transaksi}))
        .then((dynamic res) async {
      return new Model_detail_transaksi_pascabayar.map(res);
    });
  }
}
