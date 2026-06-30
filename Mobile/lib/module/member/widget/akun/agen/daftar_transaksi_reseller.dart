import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/shared/providers/AgenProvider.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/ErrorStateWidget.dart';
import 'package:outletpulsa/shared/widgets/FloatingSearchBar.dart';
import 'package:intl/intl.dart';

class Daftar_transaksi_reseller extends StatefulWidget {
  const Daftar_transaksi_reseller({super.key});

  @override
  State<Daftar_transaksi_reseller> createState() =>
      _Daftar_transaksi_resellerState();
}

class _Daftar_transaksi_resellerState
    extends State<Daftar_transaksi_reseller> {
  final config = ConfigApp();
  bool loadData = false;
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      Provider.of<Agen_provider>(context, listen: false).getTransaksiReseller(search: query.trim());
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loadData) {
      loadData = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Provider.of<Agen_provider>(context, listen: false)
            .getTransaksiReseller();
      });
    }
  }

  String formatCurrency(dynamic number) {
    if (number == null) return 'Rp 0';
    final formatter =
        NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(number);
  }

  String formatTanggal(dynamic dateVal) {
    try {
      final date = DateTime.parse(dateVal.toString()).toLocal();
      return DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(date);
    } catch (e) {
      return '-';
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
            Positioned(
                top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(
                top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(
                bottom: -40,
                left: -40,
                child: _Circle(size: 130, opacity: 0.04)),

            Positioned(
              top: compact ? 0 : 16,
              left: compact ? 0 : 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  margin:
                      compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(TablerIcons.arrow_left,
                      color: Colors.white, size: 20),
                ),
              ),
            ),

            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(
                    horizontal: 32, vertical: compact ? 32 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      'Transaksi Reseller',
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
                      'Daftar komisi agen yang belum dicairkan',
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
    final agenProv = Provider.of<Agen_provider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      floatingActionButton: FloatingSearchBar(
        controller: _searchController,
        onChanged: _onSearchChanged,
        hintText: 'Cari transaksi',
      ),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: agenProv.list_transaksi_reseller == null && agenProv.error == null
                // --- Loading ---
                ? ListView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 20),
                    itemCount: 6,
                    itemBuilder: (context, index) {
                      return const Padding(
                        padding: EdgeInsets.only(bottom: 12.0),
                        child: SkeletonWidget(
                            height: 90, width: double.infinity, radius: 16),
                      );
                    },
                  )
                // --- Error ---
                : agenProv.error == true
                    ? ErrorStateWidget(
                        config: config,
                        errorMessage:
                            agenProv.errorMsg ?? 'Terjadi kesalahan sistem',
                        onRetry: () => agenProv.getTransaksiReseller(),
                      )
                // --- Empty ---
                : (agenProv.list_transaksi_reseller?.isEmpty ?? true)
                    ? Center(
                        child: NotfoundWidget(
                          config: config,
                          label: 'Belum ada transaksi sukses\ndi bulan ini',
                        ),
                      )
                // --- Data ---
                : ListView.builder(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 20),
                    itemCount: agenProv.list_transaksi_reseller!.length,
                    itemBuilder: (context, index) {
                      final item = agenProv.list_transaksi_reseller!.values
                          .elementAt(index);
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: _TransaksiCard(
                          index: index,
                          config: config,
                          item: item,
                          formatCurrency: formatCurrency,
                          formatTanggal: formatTanggal,
                        ),
                      );
                    },
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

class _TransaksiCard extends StatelessWidget {
  const _TransaksiCard({
    required this.index,
    required this.config,
    required this.item,
    required this.formatCurrency,
    required this.formatTanggal,
  });

  final int index;
  final ConfigApp config;
  final Map<String, dynamic> item;
  final String Function(dynamic) formatCurrency;
  final String Function(dynamic) formatTanggal;

  @override
  Widget build(BuildContext context) {
    final bool isPrabayar = item['jenis'] == 'prabayar';
    final Color accentColor =
        isPrabayar ? const Color(0xFF0F1F6E) : const Color(0xFF7B1FA2);
    final int staggerIndex = index > 15 ? 15 : index;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(opacity: value, child: child),
        );
      },
      child: Container(
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
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {},
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.05),
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
                            Icon(
                              TablerIcons.tag,
                              size: 16,
                              color: accentColor,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'ID#${item['kode'] ?? item['id'] ?? '-'}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: accentColor,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Body
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Leading Icon
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: accentColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          isPrabayar
                              ? TablerIcons.device_mobile
                              : TablerIcons.receipt,
                          color: accentColor,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Content Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['produk_name'] ?? '-',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              formatCurrency(item['nominal']),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(TablerIcons.user,
                                    size: 13, color: Colors.grey),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    item['reseller_name'] ?? 'Reseller',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.poppins(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8F9FA),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Text(
                                formatTanggal(item['tanggal']),
                                style: GoogleFonts.poppins(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Nominal & Komisi
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Colors.green.withOpacity(0.35),
                                width: 1,
                              ),
                            ),
                            child: Text(
                              '+ ${formatCurrency(item['fee_agen'])}',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.green[700],
                              ),
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
        ),
      ),
    );
  }
}
