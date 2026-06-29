import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/TransactionProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/FloatingSearchBar.dart';
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
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  // Simpan referensi provider lebih awal agar dispose() bisa
  // memanggilnya dengan aman (context tidak valid saat dispose)
  Transaction_provider? _transProvider;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    // Simpan referensi provider sekali di sini (aman untuk dipakai di dispose)
    _transProvider ??= Provider.of<Transaction_provider>(context, listen: false);
    if (loadData == false) {
      loadData = true;
      // Reset dulu sebelum fetch agar UI langsung tampil skeleton
      _transProvider!.resetListProduk();
      await _transProvider!.getDaftarProdukData(
          widget.id, widget.kode, widget.name, widget.nomor_tujuan);
    }
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _searchController.dispose();
    // Bersihkan list produk saat halaman ditutup agar tidak
    // muncul sekilas data lama saat membuka kategori produk lain
    _transProvider?.resetListProduk();
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

    // Filter lokal berdasarkan search query
    Map<String, dynamic>? filteredProduk;
    if (trans.list_produk != null && _searchQuery.isNotEmpty) {
      int idx = 0;
      filteredProduk = {};
      trans.list_produk!.forEach((key, value) {
        final name = (value['name'] ?? '').toString().toLowerCase();
        final kode = (value['kode'] ?? '').toString().toLowerCase();
        if (name.contains(_searchQuery) || kode.contains(_searchQuery)) {
          filteredProduk![idx.toString()] = value;
          idx++;
        }
      });
    } else {
      filteredProduk = trans.list_produk;
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
                : filteredProduk!.isEmpty
                    ? NotfoundWidget(config: config, label: "Produk tidak ditemukan")
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 20),
                        itemCount: filteredProduk!.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: _BoxProdukData(
                              index: index,
                              kode: filteredProduk![index.toString()]['kode'],
                              operator: filteredProduk![index.toString()]['operator'],
                              nominal: filteredProduk![index.toString()]['name'],
                              harga: filteredProduk![index.toString()]['price'],
                              status: filteredProduk![index.toString()]['status'],
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
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isActive
                        ? const Color(0xFF0F1F6E).withOpacity(0.05)
                        : Colors.grey.withOpacity(0.05),
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
                            Icon(
                              TablerIcons.tag,
                              size: 16,
                              color: isActive ? const Color(0xFF0F1F6E) : Colors.grey,
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
                                  color: isActive ? const Color(0xFF0F1F6E) : Colors.grey,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        operator,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
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
                          color: isActive
                              ? const Color(0xFF0F1F6E).withOpacity(0.1)
                              : Colors.grey.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          isActive ? TablerIcons.device_mobile : TablerIcons.ban,
                          color: isActive ? const Color(0xFF0F1F6E) : Colors.grey,
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
                              nominal,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              harga,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: isActive
                                    ? const Color(0xFF1A1A2E)
                                    : Colors.grey.shade400,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Badge
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
                            color: isActive ? Colors.green[700] : Colors.red[700],
                          ),
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
