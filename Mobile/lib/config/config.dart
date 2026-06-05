import 'package:flutter/material.dart';

class ConfigApp {
  String? _mainurl;
  String? _login_url;
  String? _check_login_url;
  String? _beranda_url;
  String? _info_deposit_url;
  String? _getPrefix_url;
  String? _getDaftarProduk_url;
  String? _getDaftarProdukData_url;
  String? _getDaftarOperator_url;
  String? _getDaftarKategori_url;
  String? _getDaftarKategoriPascabayar_url;
  String? _getRiwayatPrabayar_url;
  String? _getRiwayatPascabayar_url;
  String? _getRiwayatDeposit_url;
  String? _getInfoBelumBaca_url;
  String? _getInfoSudahBaca_url;
  String? _updateStatusBaca_url;
  String? _updateNamaAkun_url;
  String? _updatePasswordAkun_url;
  String? _transferSaldo_url;
  String? _getRiwayatTransferSaldo_url;
  String? _deposit_saldo_url;
  String? _info_konfirmasi_deposit_url;
  String? _delete_konfirmasi_deposit_url;
  String? _konfirmasi_deposit_url;
  String? _detail_deposit_saldo_url;
  String? _get_otp_url;
  String? _get_otp_reset_password_url;
  String? _register_url;
  String? _reset_password_url;
  String? _prabayarTransaction_url;
  String? _detailTransaksi_url;
  String? _detailTransaksiPascabayar_url;
  String? _inquiryPascabayar_url;
  String? _pembayaranPascabayar_url;
  String? _daftarAgen_url;
  String? _daftarRiwayatPembayaran_url;

  Color? _background_color;
  Color? _background_light_color;
  Color? _background_tab;
  Color? _background_smooth_navy;

  Color? _color_shadow;

  Color? _text_dark_color;
  Color? _text_light_color;
  Color? _text_grey_color;
  Color? _text_navy_color;

  Color? _input_light_color;
  Color? _input_grey_color;

  Color? _btn_primary_color;

  // constructor
  ConfigApp() {
    // url
    _mainurl = "http://api.outletpulsa.com";
    _login_url = _mainurl! + '/login';
    _check_login_url = _mainurl! + '/check_login_url';
    _beranda_url = '/beranda';
    _info_deposit_url = '/info_tambah_deposit';
    _getPrefix_url = '/get_prefix';
    _getDaftarProduk_url = '/getDaftarProduk_url';
    _getDaftarProdukData_url = '/getDaftarProdukData_url';
    _getDaftarOperator_url = '/getDaftarOperator_url';
    _getDaftarKategori_url = '/getDaftarKategori_url';
    _getDaftarKategoriPascabayar_url = '/getDaftarKategoriPascabayar_url';
    _getRiwayatPrabayar_url = '/getRiwayatPrabayar_url';
    _getRiwayatPascabayar_url = '/getRiwayatPascabayar_url';
    _getRiwayatDeposit_url = '/getRiwayatDeposit_url';
    _getInfoBelumBaca_url = '/getInfoBelumBaca_url';
    _getInfoSudahBaca_url = '/getInfoSudahBaca_url';
    _updateStatusBaca_url = '/updateStatusBaca_url';
    _updateNamaAkun_url = '/updateNamaAkun_url';
    _updatePasswordAkun_url = '/updatePasswordAkun_url';
    _transferSaldo_url = '/transferSaldo_url';
    _getRiwayatTransferSaldo_url = '/getRiwayatTransferSaldo_url';
    _deposit_saldo_url = '/deposit_saldo_url';
    _info_konfirmasi_deposit_url = '/info_konfirmasi_deposit_url';
    _delete_konfirmasi_deposit_url = '/delete_konfirmasi_deposit_url';
    _konfirmasi_deposit_url = '/konfirmasi_deposit_url';
    _detail_deposit_saldo_url = '/detail_deposit_saldo_url';
    _get_otp_url = '/get_otp_url';
    _get_otp_reset_password_url = '/get_otp_reset_password_url';
    _register_url = '/register_url';
    _reset_password_url = '/reset_password_url';
    _prabayarTransaction_url = '/prabayarTransaction_url';
    _detailTransaksi_url = '/detailTransaksi_url';
    _detailTransaksiPascabayar_url = '/detailTransaksiPascabayar_url';
    _inquiryPascabayar_url = '/inquiryPascabayar_url';
    _pembayaranPascabayar_url = '/pembayaranPascabayar_url';
    _daftarAgen_url = '/daftarAgen_url';
    _daftarRiwayatPembayaran_url = '/daftarRiwayatPembayaranAgen_url';

    // Background COLOR
    _background_color = Color(0xFF033047);
    _background_light_color = Color.fromARGB(255, 255, 255, 255);
    _background_tab = Colors.blueGrey[50];
    _background_smooth_navy = Color(0xFF033047).withOpacity(0.96);
    // Text Color
    _text_dark_color = Color.fromARGB(255, 65, 65, 65);
    _text_navy_color = Color(0xFF033047);
    _text_light_color = Colors.white;
    _text_grey_color = Color(0xFF84A7A1);
    // input field color
    _input_light_color = Colors.white;
    _input_grey_color = Color.fromARGB(255, 236, 236, 236);

    // button color
    _btn_primary_color = Color(0xFF1F6E8C);

    _color_shadow = Colors.grey.withOpacity(0.5);
  }

  String? get mainUrl => _mainurl;
  String? get login_url => _login_url!;
  String? get check_login_url => _check_login_url!;
  String? get beranda_url => _beranda_url!;
  String? get info_deposit_url => _info_deposit_url!;
  String? get getPrefix_url => _getPrefix_url!;
  String? get getDaftarProduk_url => _getDaftarProduk_url!;
  String? get getDaftarProdukData_url => _getDaftarProdukData_url!;
  String? get getDaftarOperator_url => _getDaftarOperator_url!;
  String? get getDaftarKategori_url => _getDaftarKategori_url!;
  String? get getDaftarKategoriPascabayar_url =>
      _getDaftarKategoriPascabayar_url!;
  String? get getRiwayatPrabayar_url => _getRiwayatPrabayar_url!;
  String? get getRiwayatPascabayar_url => _getRiwayatPascabayar_url!;
  String? get getRiwayatDeposit_url => _getRiwayatDeposit_url!;
  String? get getInfoBelumBaca_url => _getInfoBelumBaca_url!;
  String? get getInfoSudahBaca_url => _getInfoSudahBaca_url!;
  String? get updateStatusBaca_url => _updateStatusBaca_url!;
  String? get updateNamaAkun_url => _updateNamaAkun_url!;
  String? get updatePasswordAkun_url => _updatePasswordAkun_url!;
  String? get transferSaldo_url => _transferSaldo_url!;
  String? get getRiwayatTransferSaldo_url => _getRiwayatTransferSaldo_url!;
  String? get deposit_saldo_url => _deposit_saldo_url!;
  String? get info_konfirmasi_deposit_url => _info_konfirmasi_deposit_url!;
  String? get delete_konfirmasi_deposit_url => _delete_konfirmasi_deposit_url!;
  String? get konfirmasi_deposit_url => _konfirmasi_deposit_url!;
  String? get detail_deposit_saldo_url => _detail_deposit_saldo_url!;
  String? get get_otp_url => _get_otp_url!;
  String? get get_otp_reset_password_url => _get_otp_reset_password_url!;
  String? get register_url => _register_url!;
  String? get reset_password_url => _reset_password_url!;
  String? get prabayarTransaction_url => _prabayarTransaction_url!;
  String? get detailTransaksi_url => _detailTransaksi_url!;
  String? get detailTransaksiPascabayar_url => _detailTransaksiPascabayar_url!;
  String? get inquiryPascabayar_url => _inquiryPascabayar_url!;
  String? get pembayaranPascabayar_url => _pembayaranPascabayar_url!;
  String? get daftarAgen_url => _daftarAgen_url!;
  String? get daftarRiwayatPembayaran_url => _daftarRiwayatPembayaran_url!;

  Color get background_color => _background_color!;
  Color get background_light_color => _background_light_color!;
  Color get background_tab => _background_tab!;
  Color get background_smooth_navy => _background_smooth_navy!;

  Color get text_dark_color => _text_dark_color!;
  Color get text_grey_color => _text_grey_color!;
  Color get text_light_color => _text_light_color!;
  Color get text_navy_color => _text_navy_color!;

  Color get input_light_color => _input_light_color!;
  Color get input_grey_color => _input_grey_color!;
  Color get btn_primary_color => _btn_primary_color!;

  Color get color_shadow => _color_shadow!;
}
