import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/RiwayatTransferProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'package:outletpulsa/shared/widgets/ErrorStateWidget.dart';
import 'package:outletpulsa/shared/widgets/FloatingSearchBar.dart';

class Riwayat_transfer_saldo extends StatefulWidget {
  const Riwayat_transfer_saldo({super.key});

  @override
  State<Riwayat_transfer_saldo> createState() => _Riwayat_transfer_saldoState();
}

class _Riwayat_transfer_saldoState extends State<Riwayat_transfer_saldo> {
  final config = ConfigApp();
  bool loadData = false;
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      Provider.of<Riwayat_transfer_saldo_provider>(context, listen: false)
          .getRiwayatTransferSaldo(search: query.trim());
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!loadData) {
      loadData = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        final provider = Provider.of<Riwayat_transfer_saldo_provider>(context,
            listen: false);
        provider.list = null; // reset list untuk trigger skeleton
        await provider.getRiwayatTransferSaldo();
      });
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
                  margin: compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
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
                      'Riwayat\nTransfer Saldo',
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
                      'Histori pengiriman dan penerimaan saldo Anda',
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
    final riwayat = Provider.of<Riwayat_transfer_saldo_provider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      floatingActionButton: FloatingSearchBar(
        controller: _searchController,
        onChanged: _onSearchChanged,
        hintText: 'Cari tujuan transfer',
      ),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: riwayat.list == null
                ? ListView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 20),
                    itemCount: 8,
                    itemBuilder: (context, index) {
                      return const Padding(
                        padding: EdgeInsets.only(bottom: 12.0),
                        child: SkeletonWidget(
                            height: 80, width: double.infinity, radius: 16),
                      );
                    },
                  )
                : riwayat.error == true && riwayat.errorMsg != null
                    ? ErrorStateWidget(
                        config: config,
                        errorMessage:
                            riwayat.errorMsg ?? 'Terjadi kesalahan sistem',
                        onRetry: () {
                          riwayat.getRiwayatTransferSaldo();
                        },
                      )
                    : riwayat.list!.isEmpty
                        ? NotfoundWidget(
                            config: config,
                            label: "Riwayat Transfer Saldo Kosong")
                        : ListView.builder(
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 20),
                            itemCount: riwayat.list!.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: BoxRiwayatTransfer(
                                  riwayat: riwayat,
                                  index: index,
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

class BoxRiwayatTransfer extends StatelessWidget {
  const BoxRiwayatTransfer({
    super.key,
    required this.riwayat,
    required this.index,
  });

  final Riwayat_transfer_saldo_provider riwayat;
  final int index;

  @override
  Widget build(BuildContext context) {
    final item = riwayat.list![index.toString()];
    if (item == null) return const SizedBox();

    String tipe = item['tipeTransaksi'] ?? '-';
    String tanggal = item['updatedAt'] ?? '-';
    String nominal = item['biaya'] ?? '-';
    String noHp = item['nowhatsapp'] ?? '-';
    String namaTarget = item['namaTarget'] ?? '-';

    bool isMasuk = tipe.toLowerCase().contains('terima') ||
        tipe.toLowerCase().contains('masuk');
    int staggerIndex = index > 15 ? 15 : index;

    Color iconColor =
        isMasuk ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F);
    Color iconBgColor =
        isMasuk ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE);
    IconData iconData =
        isMasuk ? TablerIcons.arrow_down_left : TablerIcons.arrow_up_right;

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
            onTap: () {
              // Aksi klik riwayat bisa ditambahkan di sini
            },
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: iconBgColor.withOpacity(0.5),
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
                              color: iconColor,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'ID#${item['id'] ?? '-'}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: iconColor,
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
                          color: iconBgColor,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          iconData,
                          color: iconColor,
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
                              tipe,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              namaTarget,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8F9FA),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(TablerIcons.device_mobile,
                                      size: 12, color: Colors.grey.shade600),
                                  const SizedBox(width: 4),
                                  Text(
                                    noHp,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.poppins(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Price and Badge
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            nominal,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: iconColor,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isMasuk
                                  ? Colors.green.withOpacity(0.1)
                                  : Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isMasuk
                                    ? Colors.green.withOpacity(0.4)
                                    : Colors.red.withOpacity(0.4),
                                width: 1,
                              ),
                            ),
                            child: Text(
                              isMasuk ? 'Masuk' : 'Keluar',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color:
                                    isMasuk ? Colors.green[700] : Colors.red[700],
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            tanggal,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              color: Colors.grey[400],
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
