import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/TransactionProvider.dart';
import 'package:outletpulsa/shared/widgets/ErrorStateWidget.dart';
import 'package:outletpulsa/shared/widgets/FloatingSearchBar.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'daftar_produk_data.dart';

class Daftar_operator extends StatefulWidget {
  Daftar_operator(
      {required this.nomor_tujuan,
      required this.label,
      required this.path,
      required this.title,
      required this.tipe,
      required this.prefix,
      super.key});

  final String nomor_tujuan;
  final String label;
  final String path;
  final String title;
  final String tipe;
  final bool prefix;

  @override
  State<Daftar_operator> createState() => _Daftar_operatorState();
}

class _Daftar_operatorState extends State<Daftar_operator> {
  final config = ConfigApp();
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  bool _isFetching = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_isFetching) {
        _isFetching = true;
        final provider = Provider.of<Transaction_provider>(context, listen: false);
        provider.resetListOperator();
        provider.getDaftarOperator(widget.nomor_tujuan, widget.path, widget.prefix);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
                      'Pilih Paket', // 'Pilih Kategori Paket' from title? wait, we can just use widget.title if there is one. Wait, in daftar_operator it's usually 'Pilih Kategori Paket', but I'll use widget.title if it exists or hardcode 'Pilih Paket'
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
                      'Pilih kategori paket yang Anda inginkan',
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

    // Filter lokal berdasarkan search query
    Map<String, dynamic>? filteredOperator;
    if (trans.list_operator != null && _searchQuery.isNotEmpty) {
      int idx = 0;
      filteredOperator = {};
      trans.list_operator!.forEach((key, value) {
        final name = (value['name'] ?? '').toString().toLowerCase();
        final kode = (value['kode'] ?? '').toString().toLowerCase();
        if (name.contains(_searchQuery) || kode.contains(_searchQuery)) {
          filteredOperator![idx.toString()] = value;
          idx++;
        }
      });
    } else {
      filteredOperator = trans.list_operator;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      floatingActionButton: FloatingSearchBar(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v.trim().toLowerCase()),
        hintText: 'Cari produk',
      ),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: trans.list_operator == null
                // null = loading ATAU network error
                ? (trans.error == true
                    ? ErrorStateWidget(
                        config: config,
                        errorMessage: trans.errorMsg ?? 'Terjadi kesalahan sistem',
                        onRetry: () {
                          trans.getDaftarOperator(
                              widget.nomor_tujuan, widget.path, widget.prefix);
                        },
                      )
                    : ListView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                        itemCount: 8,
                        itemBuilder: (context, index) {
                          return const Padding(
                            padding: EdgeInsets.only(bottom: 12.0),
                            child: SkeletonWidget(height: 80, width: double.infinity, radius: 16),
                          );
                        },
                      ))
                // tidak null tapi kosong = data tidak ada
                : filteredOperator!.isEmpty
                    ? NotfoundWidget(config: config, label: "Operator tidak ditemukan")
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 20),
                        itemCount: filteredOperator!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _BoxOperator(
                              index: index,
                              id: filteredOperator![index.toString()]['id'],
                              kode: filteredOperator![index.toString()]['kode'],
                              name: filteredOperator![index.toString()]['name'],
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

class _BoxOperator extends StatelessWidget {
  const _BoxOperator({
    required this.index,
    required this.id,
    required this.kode,
    required this.name,
    required this.nomor_tujuan,
  });

  final int index;
  final String id;
  final String kode;
  final String name;
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
    int staggerIndex = index > 15 ? 15 : index;
    final gradient = _gradients[index % _gradients.length];

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
            splashColor: gradient[0].withOpacity(0.08),
            highlightColor: gradient[0].withOpacity(0.04),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => Daftar_produk_data(
                    id: id,
                    kode: kode,
                    name: name,
                    nomor_tujuan: nomor_tujuan,
                  ),
                ),
              );
            },
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.05),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
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
                            const Icon(
                              TablerIcons.tag,
                              size: 16,
                              color: Color(0xFF0F1F6E),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '#$kode',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F1F6E),
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
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          TablerIcons.package,
                          color: Color(0xFF0F1F6E),
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
                              name,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Arrow with solid sapphire blue
                      const SizedBox(width: 8),
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1F6E), // Sapphire Blue
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0F1F6E).withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Icon(
                          TablerIcons.chevron_right,
                          color: Colors.white,
                          size: 17,
                        ),
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
