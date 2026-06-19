import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/skeletonWidget.dart';
import 'input_ppob.dart';

class Daftar_kategori extends StatefulWidget {
  const Daftar_kategori(
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
  State<Daftar_kategori> createState() => _Daftar_kategoriState();
}

class _Daftar_kategoriState extends State<Daftar_kategori> {
  bool loadData = false;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context, listen: false)
          .getDaftarKategori(widget.path);
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
                      'Pilih kategori produk yang Anda inginkan',
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
            child: trans.list_kategori == null
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
                : trans.list_kategori!.length == 0
                    ? NotfoundWidget(config: config, label: "Daftar Kategori Kosong")
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 20),
                        itemCount: trans.list_kategori!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _BoxKategori(
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

class _BoxKategori extends StatelessWidget {
  const _BoxKategori({
    required this.index,
    required this.config,
    required this.trans,
  });

  final int index;
  final ConfigApp config;
  final Transaction_provider trans;

  @override
  Widget build(BuildContext context) {
    int staggerIndex = index > 15 ? 15 : index;
    final item = trans.list_kategori![index.toString()];

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
                  builder: (context) => Input_ppob(
                    label: item['name'],
                    title: item['name'],
                    path: item['kode'],
                    tipe: 'prabayar',
                    checkPrefix: false,
                  ),
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Leading: Logo / Icon
                  Container(
                    width: 52,
                    height: 52,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F9FA),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Image.asset(
                      'assets/img/' +
                          (item['bank'] == 'true'
                              ? 'BANK'
                              : item['kode']) +
                          '.png',
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => Icon(
                        TablerIcons.category,
                        color: Colors.grey.shade400,
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['name'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8F9FA),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Text(
                            item['kode'],
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

                  // Chevron
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F1F6E).withOpacity(0.06),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      TablerIcons.chevron_right,
                      color: Color(0xFF0F1F6E),
                      size: 18,
                    ),
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
