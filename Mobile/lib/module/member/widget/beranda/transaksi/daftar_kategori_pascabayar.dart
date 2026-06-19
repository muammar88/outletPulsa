import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/input_ppob_pascabayar.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/skeletonWidget.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/ErrorStateWidget.dart';

class Daftar_kategori_pascabayar extends StatefulWidget {
  const Daftar_kategori_pascabayar(
      {required this.label,
      required this.title,
      required this.path,
      required this.tipe,
      super.key});

  final String label;
  final String title;
  final String path;
  final String tipe;

  @override
  State<Daftar_kategori_pascabayar> createState() =>
      _Daftar_kategori_pascabayarState();
}

class _Daftar_kategori_pascabayarState
    extends State<Daftar_kategori_pascabayar> {
  bool loadData = false;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context, listen: false)
          .getDaftarKategoriPascabayar(widget.path);
      loadData = true;
    }
    super.didChangeDependencies();
  }

  final config = ConfigApp();

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
                      widget.title,
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
                      'Pilih layanan pascabayar yang Anda inginkan',
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
    final trans = Provider.of<Transaction_provider>(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: trans.error == true
                ? ErrorStateWidget(
                    config: config,
                    errorMessage: trans.errorMsg ?? 'Terjadi kesalahan sistem',
                    onRetry: () {
                      trans.getDaftarKategoriPascabayar(widget.path);
                    },
                  )
                : trans.list_kategori_pascabayar == null
                    ? ListView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                        itemCount: 8,
                        itemBuilder: (context, index) {
                          return const Padding(
                            padding: EdgeInsets.only(bottom: 12.0),
                            child: SkeletonWidget(height: 80, width: double.infinity, radius: 16),
                          );
                        },
                      )
                    : trans.list_kategori_pascabayar!.length == 0
                        ? NotfoundWidget(config: config, label: "Daftar Produk Pascabayar")
                        : ListView.builder(
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 20),
                            itemCount: trans.list_kategori_pascabayar!.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: _BoxKategoriPascabayar(
                                  index: index,
                                  config: config,
                                  trans: trans,
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

class _BoxKategoriPascabayar extends StatelessWidget {
  const _BoxKategoriPascabayar({
    required this.index,
    required this.config,
    required this.trans,
  });

  final int index;
  final ConfigApp config;
  final Transaction_provider trans;

  @override
  Widget build(BuildContext context) {
    final item = trans.list_kategori_pascabayar![index.toString()];
    int staggerIndex = index > 15 ? 15 : index;

    String feeStr = item['fee'].toString();
    String formattedFee = feeStr.replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
    String statusStr = item['status'].toString();
    bool isActive = statusStr.toLowerCase() == 'active';

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
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => Input_ppob_pascabayar(
                    name: item['name'].toString(),
                    kode: item['kode'].toString(),
                    status: item['status'].toString(),
                    fee: item['fee'].toString(),
                  ),
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Leading Icon
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(0xFF0F1F6E).withOpacity(0.1)
                          : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      isActive
                          ? TablerIcons.receipt
                          : TablerIcons.receipt_off,
                      color:
                          isActive ? const Color(0xFF0F1F6E) : Colors.grey,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['name'].toString(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? const Color(0xFF1A1A2E)
                                : Colors.grey.shade400,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8F9FA),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Text(
                            item['kode'].toString(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Fee + Status Badge
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'Rp $formattedFee',
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isActive
                              ? const Color(0xFF0F1F6E)
                              : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'biaya admin',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          color: Colors.grey.shade500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isActive
                              ? Colors.green.withOpacity(0.1)
                              : Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isActive
                                ? Colors.green.withOpacity(0.4)
                                : Colors.red.withOpacity(0.4),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          isActive ? 'Tersedia' : 'Gangguan',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? Colors.green[700]
                                : Colors.red[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
