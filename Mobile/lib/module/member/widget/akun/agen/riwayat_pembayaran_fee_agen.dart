import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/AgenProvider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'package:outletpulsa/shared/widgets/ErrorStateWidget.dart';

class Riwayat_pembayaran_fee_agen extends StatefulWidget {
  const Riwayat_pembayaran_fee_agen({super.key});

  @override
  State<Riwayat_pembayaran_fee_agen> createState() =>
      _Riwayat_pembayaran_fee_agenState();
}

class _Riwayat_pembayaran_fee_agenState
    extends State<Riwayat_pembayaran_fee_agen> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (!loadData) {
      final beranda = Provider.of<Beranda_provider>(context, listen: false);
      if (!beranda.isAgen) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Fitur ini hanya dapat diakses oleh agen.')),
          );
          Navigator.pop(context);
        });
        return;
      }
      await _fetchData();
      loadData = true;
    }
  }

  Future<void> _fetchData() async {
    await Provider.of<Agen_provider>(context, listen: false)
        .getDaftarRiwayatPembayaranFeeAgen();
  }

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

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
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 32 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      'Riwayat Klaim Fee',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 26 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Daftar histori pencairan komisi agen',
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

  @override
  Widget build(BuildContext context) {
    final beranda = Provider.of<Beranda_provider>(context, listen: false);
    if (!beranda.isAgen) return const Scaffold(body: SizedBox.shrink());

    final list = Provider.of<Agen_provider>(context);
    bool isLoading = list.list_riwayat_pembayaran == null;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchData,
              color: _kPrimary,
              child: isLoading
                  ? ListView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                      itemCount: 6,
                      itemBuilder: (context, index) {
                        return const Padding(
                          padding: EdgeInsets.only(bottom: 12.0),
                          child: SkeletonWidget(height: 150, width: double.infinity, radius: 16),
                        );
                      },
                    )
                  : list.error == true && list.errorMsg != null
                      ? ErrorStateWidget(
                          config: config,
                          errorMessage: list.errorMsg ?? 'Terjadi kesalahan sistem',
                          onRetry: _fetchData,
                        )
                      : list.list_riwayat_pembayaran!.isEmpty
                          ? ListView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              children: [
                                SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                                NotfoundWidget(config: config, label: "Riwayat Klaim Kosong"),
                              ],
                            )
                          : ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                              itemCount: list.list_riwayat_pembayaran!.length,
                              itemBuilder: (BuildContext context, int index) {
                                final item = list.list_riwayat_pembayaran![index.toString()];
                                if (item == null) return const SizedBox();

                                return BoxListRiwayatPembayaranFeeAgen(
                                  index: index,
                                  kode: item['kode'] ?? '-',
                                  total: item['totalPayment'] ?? 0,
                                  saldoSebelum: item['saldo_sebelum_klaim'] ?? 0,
                                  saldoSetelah: item['saldo_setelah_klaim'] ?? 0,
                                  transaksiPrabayar: item['transaksiPrabayar'] ?? 0,
                                  transaksiPascabayar: item['transaksiPascabayar'] ?? 0,
                                  datetimes: item['datetimes'] ?? '-',
                                );
                              },
                            ),
            ),
          ),
        ],
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

class BoxListRiwayatPembayaranFeeAgen extends StatelessWidget {
  const BoxListRiwayatPembayaranFeeAgen({
    super.key,
    required this.index,
    required this.kode,
    required this.total,
    required this.saldoSebelum,
    required this.saldoSetelah,
    required this.transaksiPrabayar,
    required this.transaksiPascabayar,
    required this.datetimes,
  });

  final int index;
  final String kode;
  final dynamic total;
  final dynamic saldoSebelum;
  final dynamic saldoSetelah;
  final dynamic transaksiPrabayar;
  final dynamic transaksiPascabayar;
  final String datetimes;

  @override
  Widget build(BuildContext context) {
    int staggerIndex = index > 15 ? 15 : index;
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

    String formattedDate = '-';
    if (datetimes != '-') {
      try {
        DateTime parsed = DateTime.parse(datetimes).toLocal();
        formattedDate = DateFormat('dd MMM yyyy, HH:mm').format(parsed);
      } catch (e) {
        formattedDate = datetimes;
      }
    }

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32).withOpacity(0.05),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(
                  bottom: BorderSide(color: Colors.grey.shade100),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(TablerIcons.receipt_2, size: 16, color: Color(0xFF2E7D32)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '#$kode',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF2E7D32),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    formattedDate,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            
            // Body
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(TablerIcons.coin, color: Color(0xFF0F1F6E), size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Total Klaim Fee',
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              formatter.format(total is String ? num.tryParse(total) ?? 0 : total),
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green.withOpacity(0.4)),
                        ),
                        child: Text(
                          'Sukses',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.green[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Saldo Details
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F9FA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      children: [
                        _buildSaldoRow('Saldo Sebelum', formatter.format(saldoSebelum is String ? num.tryParse(saldoSebelum) ?? 0 : saldoSebelum)),
                        const SizedBox(height: 8),
                        _buildSaldoRow('Saldo Setelah', formatter.format(saldoSetelah is String ? num.tryParse(saldoSetelah) ?? 0 : saldoSetelah), isHighlight: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Transaction Chips
                  Row(
                    children: [
                      Expanded(
                        child: _buildTransactionType(
                          'Prabayar',
                          transaksiPrabayar.toString(),
                          TablerIcons.device_mobile,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildTransactionType(
                          'Pascabayar',
                          transaksiPascabayar.toString(),
                          TablerIcons.file_invoice,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSaldoRow(String label, String value, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w600,
            color: isHighlight ? const Color(0xFF1A1A2E) : Colors.grey.shade700,
          ),
        ),
      ],
    );
  }

  Widget _buildTransactionType(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 14, color: Colors.grey[600]),
          const SizedBox(width: 6),
          Text(
            '$value $label',
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}
