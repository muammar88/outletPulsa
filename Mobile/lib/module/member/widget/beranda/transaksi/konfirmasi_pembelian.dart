import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/TransactionProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/shared/widgets/CircularProgressWidget.dart';
import 'detail_transaksi.dart';

class Konfirmasi_pembelian extends StatefulWidget {
  Konfirmasi_pembelian(
      {super.key,
      required this.kode,
      required this.nominal,
      required this.operator,
      required this.harga,
      required this.nomor_tujuan});

  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String nomor_tujuan;

  @override
  State<Konfirmasi_pembelian> createState() => _Konfirmasi_pembelianState();
}

class _Konfirmasi_pembelianState extends State<Konfirmasi_pembelian> with SingleTickerProviderStateMixin {
  final config = ConfigApp();

  static const double _kWideBreakpoint = 700.0;
  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
        .animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor:
            isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Icon(
              isSuccess ? TablerIcons.circle_check : TablerIcons.alert_circle,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message,
                  style:
                      GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm(Load_provider loader) async {
    loader.isLoad = true;

    final trans = Provider.of<Transaction_provider>(context, listen: false);

    var feedBack = await trans.prabayarTransaction(
        widget.nomor_tujuan.replaceAll(RegExp(r'\s+'), ''), widget.kode);

    loader.isLoad = false;

    if (feedBack.error == false) {
      _showSnackBar(feedBack.errorMsg ?? 'Transaksi Berhasil', isSuccess: true);

      Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_transaksi(
                  kodeTrans: feedBack.kodeTransaksi!)));
    } else {
      _showSnackBar(feedBack.errorMsg ?? 'Terjadi kesalahan', isSuccess: false);
    }
  }

  Widget _buildBrandPanel({bool compact = false}) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [_kPrimary, _kPrimaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Positioned(top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(bottom: -40, left: -40, child: _Circle(size: 130, opacity: 0.04)),

            Positioned(
              top: compact ? 0 : 16,
              left: compact ? 0 : 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  margin: compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(TablerIcons.arrow_left, color: Colors.white, size: 20),
                ),
              ),
            ),

            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 48 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
                      ),
                      child: const Icon(TablerIcons.file_invoice, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Konfirmasi\nPembelian',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Pastikan data transaksi sudah benar sebelum melanjutkan pembayaran',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 13 : 15,
                        color: Colors.white.withOpacity(0.85),
                        height: 1.5,
                      ),
                    ),
                    if (compact) const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A2E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard(Load_provider loader, {bool isWide = false}) {
    return Container(
      padding: EdgeInsets.all(isWide ? 40 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: isWide
            ? [
                BoxShadow(
                  color: _kPrimary.withOpacity(0.08),
                  blurRadius: 40,
                  offset: const Offset(0, 15),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(TablerIcons.receipt, color: _kPrimary.withOpacity(0.7), size: 20),
              const SizedBox(width: 8),
              Text(
                'Detail Pesanan',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: _kPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.grey.withOpacity(0.2)),
          const SizedBox(height: 8),
          
          _buildDataRow('Kode Produk', widget.kode),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Image.asset('assets/img/tengah.png', fit: BoxFit.cover, height: 4),
          ),
          _buildDataRow('Nominal Produk', widget.nominal),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Image.asset('assets/img/tengah.png', fit: BoxFit.cover, height: 4),
          ),
          _buildDataRow('Harga Produk', widget.harga),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Image.asset('assets/img/tengah.png', fit: BoxFit.cover, height: 4),
          ),
          _buildDataRow('Nomor Tujuan', widget.nomor_tujuan),
          
          const SizedBox(height: 36),
          
          GestureDetector(
            onTap: loader.isLoad == true ? null : () => _submitForm(loader),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: loader.isLoad == true
                      ? [Colors.grey.shade400, Colors.grey.shade500]
                      : [_kPrimary, _kPrimaryLight],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: loader.isLoad == true
                    ? null
                    : [
                        BoxShadow(
                          color: _kPrimary.withOpacity(0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (loader.isLoad == true)
                    const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  else
                    const Icon(TablerIcons.check, size: 22, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(
                    loader.isLoad == true ? "Memproses..." : "Konfirmasi Pembelian",
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Consumer<Load_provider>(
        builder: (context, loader, child) {
          return LayoutBuilder(
            builder: (context, constraints) {
              bool isWide = constraints.maxWidth >= _kWideBreakpoint;

              if (isWide) {
                return Row(
                  children: [
                    Expanded(flex: 5, child: _buildBrandPanel()),
                    Expanded(
                      flex: 6,
                      child: Container(
                        color: Colors.white,
                        child: SafeArea(
                          child: Center(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
                              physics: const BouncingScrollPhysics(),
                              child: FadeTransition(
                                opacity: _fadeAnim,
                                child: SlideTransition(
                                  position: _slideAnim,
                                  child: _buildFormCard(loader, isWide: true),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }

              return SafeArea(
                top: false,
                child: LayoutBuilder(
                  builder: (context, safeConstraints) {
                    return SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(minHeight: safeConstraints.maxHeight),
                        child: IntrinsicHeight(
                          child: FadeTransition(
                            opacity: _fadeAnim,
                            child: SlideTransition(
                              position: _slideAnim,
                              child: Column(
                                children: [
                                  _buildBrandPanel(compact: true),
                                  Expanded(
                                    child: Container(
                                      width: double.infinity,
                                      color: const Color(0xFFF0F2F8),
                                      child: Column(
                                        children: [
                                          Transform.translate(
                                            offset: const Offset(0, -30),
                                            child: Padding(
                                              padding: const EdgeInsets.symmetric(horizontal: 20),
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  color: Colors.white,
                                                  borderRadius: BorderRadius.circular(28),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: _kPrimary.withOpacity(0.08),
                                                      blurRadius: 30,
                                                      offset: const Offset(0, 10),
                                                    ),
                                                  ],
                                                ),
                                                child: _buildFormCard(loader),
                                              ),
                                            ),
                                          ),
                                          const Spacer(),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _Circle extends StatelessWidget {
  final double size;
  final double opacity;

  const _Circle({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withOpacity(opacity),
      ),
    );
  }
}
