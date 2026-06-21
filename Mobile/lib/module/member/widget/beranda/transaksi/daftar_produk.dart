import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/TransactionProvider.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../widget/skeletonWidget.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/ErrorStateWidget.dart';
import 'konfirmasi_pembelian.dart';

class Daftar_produk extends StatefulWidget {
  Daftar_produk(
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
  State<Daftar_produk> createState() => _Daftar_produkState();
}

class _Daftar_produkState extends State<Daftar_produk> {
  final config = ConfigApp();
  bool loadData = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      final trans = Provider.of<Transaction_provider>(context, listen: false);
      if (trans.hasNextPage && !trans.isLoadingNextPage) {
        trans.getDaftarProduk(operator: widget.path, isLoadMore: true);
      }
    }
  }

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context, listen: false)
          .getDaftarProduk(operator: widget.path);
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
                      'Pilih produk yang Anda inginkan',
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
                : trans.error == true && trans.errorMsg != null
                    ? ErrorStateWidget(
                        config: config,
                        errorMessage: trans.errorMsg ?? 'Terjadi kesalahan sistem',
                        onRetry: () {
                          trans.getDaftarProduk(operator: widget.path);
                        },
                      )
                    : trans.list_produk!.length == 0
                        ? NotfoundWidget(
                            config: config, label: "Daftar Produk Kosong")
                        : ListView.builder(
                            controller: _scrollController,
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 20),
                            itemCount: trans.list_produk!.length + (trans.isLoadingNextPage ? 1 : 0),
                            itemBuilder: (BuildContext context, int index) {
                              if (index == trans.list_produk!.length) {
                                return const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 20.0),
                                  child: Center(
                                    child: SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(strokeWidth: 2.5),
                                    ),
                                  ),
                                );
                              }
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12.0),
                                child: BoxListProduk(
                                  index: index,
                                  config: config,
                                  kode: trans.list_produk![index.toString()]
                                      ['kode'],
                                  operator: trans.list_produk![index.toString()]
                                      ['operator'],
                                  nominal: trans.list_produk![index.toString()]
                                      ['name'],
                                  harga: trans.list_produk![index.toString()]
                                      ['price'],
                                  status: trans.list_produk![index.toString()]
                                      ['status'],
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

class BoxListProduk extends StatelessWidget {
  const BoxListProduk({
    super.key,
    required this.index,
    required this.config,
    required this.kode,
    required this.nominal,
    required this.operator,
    required this.harga,
    required this.status,
    required this.nomor_tujuan,
  });

  final int index;
  final ConfigApp config;
  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String status;
  final String nomor_tujuan;

  @override
  Widget build(BuildContext context) {
    bool isActive = status == 'active';
    int staggerIndex = index > 15 ? 15 : index;

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
                      'Produk sedang gangguan / tidak dapat dibeli',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Colors.white,
                      ),
                    ),
                  ),
                );
              }
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
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isActive
                                ? const Color(0xFF1A1A2E)
                                : Colors.grey.shade400,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          operator,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Colors.grey.shade600,
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
                            kode,
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

                  // Price and Badge
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        harga,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isActive
                              ? const Color(0xFF0F1F6E)
                              : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 10),
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
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

