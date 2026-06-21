import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/TransactionProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'konfirmasi_pembelian.dart';

class Daftar_produk_data extends StatefulWidget {
  const Daftar_produk_data(
      {required this.id,
      required this.kode,
      required this.name,
      required this.nomor_tujuan,
      super.key});

  final String id;
  final String kode;
  final String name;
  final String nomor_tujuan;

  @override
  State<Daftar_produk_data> createState() => _Daftar_produk_dataState();
}

class _Daftar_produk_dataState extends State<Daftar_produk_data> {
  final config = ConfigApp();
  bool loadData = false;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context, listen: false).getDaftarProdukData(
          widget.id, widget.kode, widget.name, widget.nomor_tujuan);
      loadData = true;
    }
    super.didChangeDependencies();
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
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 32 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      widget.name,
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
                      'Pilih paket yang Anda inginkan',
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
            child: trans.list_produk == null
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
                : trans.list_produk!.length == 0
                    ? NotfoundWidget(config: config, label: "Daftar Produk Data Kosong")
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 20),
                        itemCount: trans.list_produk!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _BoxProdukData(
                              index: index,
                              kode: trans.list_produk![index.toString()]['kode'],
                              operator: trans.list_produk![index.toString()]['operator'],
                              nominal: trans.list_produk![index.toString()]['name'],
                              harga: trans.list_produk![index.toString()]['price'],
                              status: trans.list_produk![index.toString()]['status'],
                              nomor_tujuan: widget.nomor_tujuan,
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

class _BoxProdukData extends StatelessWidget {
  const _BoxProdukData({
    required this.index,
    required this.kode,
    required this.nominal,
    required this.operator,
    required this.harga,
    required this.status,
    required this.nomor_tujuan,
  });

  final int index;
  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String status;
  final String nomor_tujuan;

  // Gradient palettes for accent color per card (cycles through)
  static const List<List<Color>> _gradients = [
    [Color(0xFF6C63FF), Color(0xFF8B5CF6)],
    [Color(0xFF0EA5E9), Color(0xFF2563EB)],
    [Color(0xFF10B981), Color(0xFF059669)],
    [Color(0xFFF59E0B), Color(0xFFD97706)],
    [Color(0xFFEF4444), Color(0xFFDC2626)],
    [Color(0xFF8B5CF6), Color(0xFFEC4899)],
    [Color(0xFF14B8A6), Color(0xFF0D9488)],
    [Color(0xFFF97316), Color(0xFFEA580C)],
  ];

  @override
  Widget build(BuildContext context) {
    bool isActive = status == 'active';
    int staggerIndex = index > 15 ? 15 : index;
    final gradient = isActive ? _gradients[index % _gradients.length] : [Colors.grey.shade400, Colors.grey.shade300];

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 250 + (staggerIndex * 40)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 24 * (1 - value)),
          child: Opacity(opacity: value, child: child),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            if (isActive)
              BoxShadow(
                color: gradient[0].withOpacity(0.12),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
            splashColor: isActive ? gradient[0].withOpacity(0.08) : Colors.transparent,
            highlightColor: isActive ? gradient[0].withOpacity(0.04) : Colors.transparent,
            onTap: () {
              if (isActive) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Konfirmasi_pembelian(
                      kode: kode,
                      nominal: nominal,
                      operator: operator,
                      harga: harga,
                      nomor_tujuan: nomor_tujuan,
                    ),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: const Color(0xFFD32F2F),
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    content: Text(
                      'Produk tidak aktif tidak dapat dibeli',
                      style: GoogleFonts.poppins(
                          fontSize: 13, color: Colors.white),
                    ),
                  ),
                );
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Leading: Gradient icon container
                  Container(
                    width: 58,
                    height: 58,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          gradient[0].withOpacity(0.12),
                          gradient[1].withOpacity(0.06),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: gradient[0].withOpacity(0.15),
                        width: 1,
                      ),
                    ),
                    child: Icon(
                      isActive ? TablerIcons.device_mobile : TablerIcons.ban,
                      color: gradient[0],
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),

                  // Content Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          nominal,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w700,
                            color: isActive
                                ? const Color(0xFF0F172A)
                                : Colors.grey.shade500,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          operator,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    gradient[0].withOpacity(0.12),
                                    gradient[1].withOpacity(0.08),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                kode,
                                style: GoogleFonts.poppins(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                  color: gradient[0],
                                  letterSpacing: 0.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Price and Badge
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        harga,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: isActive
                              ? const Color(0xFF0F172A)
                              : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: isActive
                              ? Colors.green.withOpacity(0.1)
                              : Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          isActive ? 'Tersedia' : 'Gangguan',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
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
