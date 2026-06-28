import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/KonfirmasiProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';

class Konfirmasi_deposit_saldo extends StatefulWidget {
  const Konfirmasi_deposit_saldo({super.key});

  @override
  State<Konfirmasi_deposit_saldo> createState() => _Konfirmasi_deposit_saldoState();
}

class _Konfirmasi_deposit_saldoState extends State<Konfirmasi_deposit_saldo> with SingleTickerProviderStateMixin {
  final config = ConfigApp();

  bool loadData = false;
  bool update = false;

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
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      loadData = true;

      await Provider.of<Konfirmasi_provider>(context, listen: false).getInfoKonfirmasi();
      update = true;
    }
    if (update == true) {
      update = false;
    }
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
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
              child: Text(message, style: GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _peringatanBatalkanDeposit() async {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(TablerIcons.alert_triangle, color: Color(0xFFD32F2F), size: 28),
              const SizedBox(width: 10),
              Text('Batalkan',
                  style: GoogleFonts.poppins(
                      fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFFD32F2F))),
            ],
          ),
          content: Text('Apakah anda yakin ingin membatalkan permintaan deposit ini?',
              style: GoogleFonts.poppins(fontSize: 14, color: const Color(0xFF1A1A2E), height: 1.5)),
          actions: <Widget>[
            TextButton(
              child: Text('TIDAK',
                  style: GoogleFonts.poppins(
                      fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD32F2F),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text('YA, BATALKAN',
                  style: GoogleFonts.poppins(
                      fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
              onPressed: () async {
                Navigator.of(context).pop();
                loader.isLoad = true;
                final konf = Provider.of<Konfirmasi_provider>(context, listen: false);
                var deletes = await konf.deleteKonfirmasi();
                if (deletes.error == false) {
                  loader.isLoad = false;
                  Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  _showSnackBar(konf.errorMsg ?? 'Deposit berhasil dibatalkan', isSuccess: true);
                } else {
                  loader.isLoad = false;
                  _showSnackBar(konf.errorMsg ?? 'Gagal membatalkan deposit', isSuccess: false);
                }
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _peringatanKonfirmasiDeposit() async {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(TablerIcons.info_circle, color: _kPrimary, size: 28),
              const SizedBox(width: 10),
              Text('Konfirmasi',
                  style: GoogleFonts.poppins(
                      fontSize: 20, fontWeight: FontWeight.bold, color: _kPrimary)),
            ],
          ),
          content: Text(
              'Apakah anda yakin sudah mengirimkan dana sesuai dengan nomor rekening dan nominal transfer?',
              style: GoogleFonts.poppins(fontSize: 14, color: const Color(0xFF1A1A2E), height: 1.5)),
          actions: <Widget>[
            TextButton(
              child: Text('BELUM',
                  style: GoogleFonts.poppins(
                      fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: Text('YA, SUDAH',
                  style: GoogleFonts.poppins(
                      fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
              onPressed: () async {
                Navigator.of(context).pop();
                loader.isLoad = true;
                final konf = Provider.of<Konfirmasi_provider>(context, listen: false);
                var konfirmasi = await konf.konfirmasiDeposit();
                if (konfirmasi.error == false) {
                  loader.isLoad = false;
                  Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  _showSnackBar(konf.errorMsg ?? 'Konfirmasi berhasil dikirim', isSuccess: true);
                } else {
                  loader.isLoad = false;
                  _showSnackBar(konf.errorMsg ?? 'Gagal mengirim konfirmasi', isSuccess: false);
                }
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: NotfoundWidget(
        label: 'Konfirmasi Deposit Kosong',
        subtitle: 'Saat ini tidak ada permintaan deposit\nyang menunggu konfirmasi pembayaran.',
        icon: TablerIcons.receipt_off,
      ),
    );
  }

  Widget _buildBrandPanel({bool compact = false}) {
    return Container(
      width: double.infinity,
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
                onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
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
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 40 : 0),
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
                      child: const Icon(TablerIcons.receipt_2, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Detail\nPembayaran',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Selesaikan pembayaran agar saldo otomatis bertambah',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 13 : 15,
                        color: Colors.white.withOpacity(0.85),
                        height: 1.5,
                      ),
                    ),
                    if (compact) const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isStatus = false, Color? statusColor, bool isCopy = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF8898AA),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: isStatus
                ? Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor?.withOpacity(0.1) ?? Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: statusColor?.withOpacity(0.3) ?? Colors.grey.shade300),
                      ),
                      child: Text(
                        value,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: statusColor ?? Colors.grey.shade700,
                        ),
                      ),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Flexible(
                        child: Text(
                          value,
                          textAlign: TextAlign.right,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                      ),
                      if (isCopy) ...[
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () async {
                            await Clipboard.setData(ClipboardData(text: value));
                            _showSnackBar('Berhasil disalin: $value', isSuccess: true);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0F2F8),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(TablerIcons.copy, size: 16, color: _kPrimary),
                          ),
                        ),
                      ]
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentCard(Konfirmasi_provider info, Load_provider loader, {bool isWide = false}) {
    Color statusDepColor = info.status_deposit == 'proses'
        ? const Color(0xFFF59E0B)
        : info.status_deposit == 'gagal'
            ? const Color(0xFFDC2626)
            : const Color(0xFF10B981);
            
    Color statusKirimColor = info.status_kirim == 'belum_kirim'
        ? const Color(0xFFDC2626)
        : const Color(0xFF10B981);

    return Container(
      padding: EdgeInsets.all(isWide ? 40 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: isWide
            ? [BoxShadow(color: _kPrimary.withOpacity(0.08), blurRadius: 40, offset: const Offset(0, 15))]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(TablerIcons.info_square_rounded, color: Color(0xFFD97706), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Silahkan lakukan transfer sesuai dengan Nominal Deposit ke Rekening Tujuan.\n\nTransaksi diproses jam 09.00 - 21.00 WIB. Kesalahan transfer di luar tanggung jawab kami.',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: const Color(0xFF92400E),
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Informasi Transaksi',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                _buildDetailRow('Kode Tiket', info.kode ?? '-'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Nominal', 'Rp ${info.nominal ?? '-'}', isCopy: true),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Bank Tujuan', info.bank_tujuan_transfer ?? '-'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('No. Rekening', info.nomor_rekening_akun ?? '-', isCopy: true),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Nama Pemilik', info.nama_akun ?? '-'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Status',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                _buildDetailRow('Status Deposit', info.status_deposit?.toUpperCase() ?? '-', isStatus: true, statusColor: statusDepColor),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Status Kirim', info.status_kirim?.replaceAll('_', ' ').toUpperCase() ?? '-', isStatus: true, statusColor: statusKirimColor),
              ],
            ),
          ),

        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final info_konfirmasi = Provider.of<Konfirmasi_provider>(context);
    final isError = info_konfirmasi.error == true || info_konfirmasi.kode == null;

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
                                  child: isError ? _buildEmptyState() : Column(
                                    children: [
                                      _buildContentCard(info_konfirmasi, loader, isWide: true),
                                      const SizedBox(height: 32),
                                      SizedBox(
                                        width: double.infinity,
                                        child: ElevatedButton.icon(
                                          icon: const Icon(TablerIcons.arrow_left, size: 18, color: Colors.white),
                                          label: Text('Kembali ke Beranda',
                                              style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: _kPrimary,
                                            padding: const EdgeInsets.symmetric(vertical: 16),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                            elevation: 0,
                                          ),
                                          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                                        ),
                                      ),
                                    ],
                                  ),
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
                                      child: isError
                                          ? _buildEmptyState()
                                          : Column(
                                              children: [
                                                Transform.translate(
                                                  offset: const Offset(0, -30),
                                                  child: Padding(
                                                    padding: const EdgeInsets.symmetric(horizontal: 20),
                                                    child: Column(
                                                      children: [
                                                        Container(
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
                                                          child: _buildContentCard(info_konfirmasi, loader),
                                                        ),
                                                        const SizedBox(height: 24),
                                                        SizedBox(
                                                          width: double.infinity,
                                                          child: ElevatedButton.icon(
                                                            icon: const Icon(TablerIcons.arrow_left, size: 18, color: Colors.white),
                                                            label: Text('Kembali ke Beranda',
                                                                style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                                                            style: ElevatedButton.styleFrom(
                                                              backgroundColor: _kPrimary,
                                                              padding: const EdgeInsets.symmetric(vertical: 16),
                                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                              elevation: 0,
                                                            ),
                                                            onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                                                          ),
                                                        ),
                                                      ],
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
