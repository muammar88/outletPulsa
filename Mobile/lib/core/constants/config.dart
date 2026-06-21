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
    // _mainurl = "http://10.94.252.166:3005/api";
    _mainurl = "https://api.outletpulsa.com/api";
    _login_url = '$_mainurl/auth/login';
    _check_login_url = '$_mainurl/auth/check-login';
    _beranda_url = '$_mainurl/beranda';
    _info_deposit_url = '$_mainurl/deposit-info';
    _getPrefix_url = '$_mainurl/daftar-produk/get-prefix';
    _getDaftarProduk_url = '$_mainurl/daftar-produk';
    _getDaftarProdukData_url = '$_mainurl/daftar-produk-data';
    _getDaftarOperator_url = '$_mainurl/daftar-operator';
    _getDaftarKategori_url = '$_mainurl/daftar-kategori';
    _getDaftarKategoriPascabayar_url = '$_mainurl/daftar-kategori-pascabayar';
    _getRiwayatPrabayar_url = '$_mainurl/riwayat-prabayar';
    _getRiwayatPascabayar_url = '$_mainurl/riwayat-pascabayar';
    _getRiwayatDeposit_url = '$_mainurl/riwayat-deposit';
    _getRiwayatTransferSaldo_url = '$_mainurl/riwayat-transfer-saldo';
    _getInfoBelumBaca_url = '$_mainurl/info/belum-baca';
    _getInfoSudahBaca_url = '$_mainurl/info/sudah-baca';
    _updateStatusBaca_url = '$_mainurl/info/update-status-baca';
    _updateNamaAkun_url = '$_mainurl/akun/akun-update-nama';
    _updatePasswordAkun_url = '$_mainurl/akun/akun-update-password';
    _transferSaldo_url = '$_mainurl/transfer-saldo';
    _deposit_saldo_url = '$_mainurl/deposit-saldo';
    _info_konfirmasi_deposit_url = '$_mainurl/deposit-info-konfirmasi';
    _delete_konfirmasi_deposit_url = '$_mainurl/deposit-delete-konfirmasi';
    _konfirmasi_deposit_url = '$_mainurl/deposit-konfirmasi';
    _detail_deposit_saldo_url = '$_mainurl/deposit-detail';
    _get_otp_url = '$_mainurl/otp-register';
    _get_otp_reset_password_url = '$_mainurl/otp-reset-password';
    _register_url = '$_mainurl/register';
    _reset_password_url = '$_mainurl/reset-password';
    _prabayarTransaction_url = '$_mainurl/transaksi-prabayar';
    _detailTransaksi_url = '$_mainurl/transaksi-detail';
    _detailTransaksiPascabayar_url = '$_mainurl/transaksi-detail-pascabayar';
    _inquiryPascabayar_url = '$_mainurl/pascabayar-inquiry';
    _pembayaranPascabayar_url = '$_mainurl/pascabayar-pembayaran';
    _daftarAgen_url = '$_mainurl/agen-daftar';
    _daftarRiwayatPembayaran_url = '$_mainurl/agen-riwayat-pembayaran';

    // Background COLOR
    _background_color = const Color(0xFF0F1F6E);           // Royal Sapphire deep
    _background_light_color = const Color(0xFFFFFFFF);
    _background_tab = const Color(0xFFF0F2F8);             // cool grey-blue tint
    _background_smooth_navy = const Color(0xFF0F1F6E);     // same deep sapphire

    // Text Color
    _text_dark_color = const Color(0xFF1A1A2E);            // very dark blue-black
    _text_navy_color = const Color(0xFF0F1F6E);            // Royal Sapphire
    _text_light_color = Colors.white;
    _text_grey_color = const Color(0xFF8898AA);            // cool blue-grey

    // input field color
    _input_light_color = Colors.white;
    _input_grey_color = const Color(0xFFECEFF8);           // icy blue tint

    // button color
    _btn_primary_color = const Color(0xFF1A3DB5);          // Royal Sapphire mid

    _color_shadow = const Color(0xFF0F1F6E).withOpacity(0.15);
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
