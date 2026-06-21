import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/module/member/widget/beranda/deposit/form_input_deposit.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/daftar_kategori.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/daftar_kategori_pascabayar.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/input_ppob.dart';

// ─────────────────────────────────────────────
// Constant Colors
// ─────────────────────────────────────────────
const _kPrimary = Color(0xFF0F1F6E);
const _kPrimaryLight = Color(0xFF1A3DB5);
const _kBg = Color(0xFFF0F2F8);

class Beranda_tab extends StatefulWidget {
  const Beranda_tab({
    Key? key,
    required GlobalKey<RefreshIndicatorState> refreshIndicatorKey,
    required this.config,
  })  : _refreshIndicatorKey = refreshIndicatorKey,
        super(key: key);

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey;
  final ConfigApp config;

  @override
  State<Beranda_tab> createState() => _Beranda_tabState();
}

class _Beranda_tabState extends State<Beranda_tab> {
  bool _isInit = true;
  bool _isLoading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit) {
      _isInit = false;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (mounted) {
          setState(() {
            _isLoading = true;
          });
        }
        await Provider.of<Beranda_provider>(context, listen: false)
            .get_data_beranda();
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      });
    }
  }

  Widget _buildLoadingScreen() {
    return Material(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                // Outer circle background
                Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _kPrimary.withOpacity(0.04),
                  ),
                ),
                // Inner icon container
                Container(
                  width: 75,
                  height: 75,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: _kPrimary.withOpacity(0.12),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Image.asset(
                      'assets/img/logo-cycle.png',
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        TablerIcons.apps,
                        size: 34,
                        color: _kPrimary,
                      ),
                    ),
                  ),
                ),
                // Elegant thin spinner around the outer circle
                const SizedBox(
                  width: 110,
                  height: 110,
                  child: CircularProgressIndicator(
                    color: _kPrimary,
                    strokeWidth: 2.5,
                    backgroundColor: Colors.transparent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 36),
            Text(
              'Menyiapkan Dasbor',
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1A1A2E),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Memuat layanan dan info terbaru untuk Anda...',
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildLoadingScreen();
    }

    return Consumer<Load_provider>(
      builder: (context, loader, child) => Container(
        color: Colors.white,
        child: RefreshIndicator(
          key: widget._refreshIndicatorKey,
          color: _kPrimary,
          onRefresh: () async {
            setState(() {
              _isLoading = true;
            });
            await Provider.of<Beranda_provider>(context, listen: false)
                .get_data_beranda();
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          child: CustomScrollView(
            physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics()),
            slivers: [
              // ── Header Gradient ──
              SliverToBoxAdapter(
                child: _HeaderCard(config: widget.config, loader: loader),
              ),

              // ── Body Padding ──
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: 24),
                    // Prabayar Section
                    _SectionHeader(
                        title: 'Prabayar', icon: TablerIcons.device_sim),
                    const SizedBox(height: 14),
                    _MenuGrid(
                      config: widget.config,
                      loader: loader,
                      items: _prabayarItems,
                    ),

                    const SizedBox(height: 24),

                    // Pascabayar Section
                    _SectionHeader(
                        title: 'Pascabayar', icon: TablerIcons.receipt),
                    const SizedBox(height: 14),
                    _MenuGrid(
                      config: widget.config,
                      loader: loader,
                      items: _pascabayarItems,
                    ),

                    const SizedBox(height: 100),
                  ]),
                ),
              ),
            ],
          ),
        ), // close RefreshIndicator
      ), // close Container
    ); // close Consumer
  }
}

// ─────────────────────────────────────────────
// Menu Data Models
// ─────────────────────────────────────────────
class _MenuItemData {
  final String label;
  final String title;
  final String path;
  final IconData icon;
  final String tipe;

  const _MenuItemData({
    required this.label,
    required this.title,
    required this.path,
    required this.icon,
    required this.tipe,
  });
}

const _prabayarItems = [
  _MenuItemData(
      label: 'Pulsa\nReguler',
      title: 'Pulsa Reguler',
      path: 'PIU',
      icon: TablerIcons.device_mobile,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Pulsa\nTransfer',
      title: 'Pulsa Transfer',
      path: 'PT',
      icon: TablerIcons.arrows_exchange,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Paket\nData',
      title: 'Paket Data',
      path: 'PD',
      icon: TablerIcons.wifi,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Paket\nTelpon',
      title: 'Paket Telpon',
      path: 'PTP',
      icon: TablerIcons.phone_call,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Paket\nSMS',
      title: 'Paket SMS',
      path: 'PS',
      icon: TablerIcons.message,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Pulsa\nInternasl',
      title: 'Pulsa International',
      path: 'PI',
      icon: TablerIcons.world,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Token\nListrik',
      title: 'Token Listrik',
      path: 'TLOF',
      icon: TablerIcons.bolt,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Uang\nDigital',
      title: 'Uang Digital',
      path: 'UD',
      icon: TablerIcons.wallet,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'Wifi ID',
      title: 'Wifi ID',
      path: 'WIFI',
      icon: TablerIcons.router,
      tipe: 'prabayar'),
  _MenuItemData(
      label: 'E-Toll',
      title: 'E-Toll',
      path: 'ET',
      icon: TablerIcons.car,
      tipe: 'prabayar'),
];

const _pascabayarItems = [
  _MenuItemData(
      label: 'PLN\nPascabayar',
      title: 'PLN Pascabayar',
      path: 'PLNPASCABAYAR',
      icon: TablerIcons.bolt,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'Telkom',
      title: 'Telkom',
      path: 'TELKOM',
      icon: TablerIcons.phone,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'PDAM',
      title: 'PDAM',
      path: 'PDAM',
      icon: TablerIcons.droplet,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'BPJS',
      title: 'BPJS',
      path: 'BPJS',
      icon: TablerIcons.heartbeat,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'TV\nPascabayar',
      title: 'TV Pascabayar',
      path: 'TVK',
      icon: TablerIcons.device_tv,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'PGN',
      title: 'PGN',
      path: 'PGN',
      icon: TablerIcons.flame,
      tipe: 'pascabayar'),
  _MenuItemData(
      label: 'Internet',
      title: 'Internet',
      path: 'INT',
      icon: TablerIcons.globe,
      tipe: 'pascabayar'),
];

// ─────────────────────────────────────────────
// Header Card with Saldo (full — no AppBar above)
// ─────────────────────────────────────────────
class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.config, required this.loader});
  final ConfigApp config;
  final Load_provider loader;

  @override
  Widget build(BuildContext context) {
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
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: Consumer<Beranda_provider>(
            builder: (context, data, _) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Baris 1: Logo + Info User + Refresh ──
                Row(
                  children: [
                    // Logo
                    Container(
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Image.asset(
                        'assets/img/logo-cycle.png',
                        width: 26,
                        height: 26,
                        errorBuilder: (_, __, ___) => const Icon(
                          TablerIcons.bolt,
                          color: _kPrimary,
                          size: 26,
                        ),
                      ),
                    ),

                    // Nama & Nomor WA
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          loader.isLoad == true
                              ? _ShimmerBox(width: 120, height: 15, radius: 4)
                              : Text(
                                  data.name ?? 'User',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                          const SizedBox(height: 2),
                          loader.isLoad == true
                              ? _ShimmerBox(width: 90, height: 12, radius: 4)
                              : Text(
                                  data.nomor_whatsapp ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                        ],
                      ),
                    ),

                    // Tombol Refresh
                    InkWell(
                      onTap: () async {
                        final l =
                            Provider.of<Load_provider>(context, listen: false);
                        l.isLoad = true;
                        await Provider.of<Beranda_provider>(context,
                                listen: false)
                            .get_data_beranda();
                        l.isLoad = false;
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          TablerIcons.refresh,
                          size: 20,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // ── Baris 2: Saldo Card ──
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Saldo Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: _kPrimary.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    TablerIcons.wallet,
                                    size: 14,
                                    color: _kPrimary,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Deposit Saya',
                                  style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            loader.isLoad == true
                                ? _ShimmerBox(width: 130, height: 24)
                                : Text(
                                    data.saldo != null
                                        ? 'Rp ${data.saldo!.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}'
                                        : 'Rp 0',
                                    style: GoogleFonts.poppins(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800,
                                      color: _kPrimary,
                                    ),
                                  ),
                            const SizedBox(height: 8),
                            loader.isLoad == true
                                ? _ShimmerBox(width: 70, height: 20, radius: 20)
                                : Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _kPrimary.withOpacity(0.07),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                          color: _kPrimary.withOpacity(0.15),
                                          width: 1),
                                    ),
                                    child: Text(
                                      'Kode: ${data.kode ?? '-'}',
                                      style: GoogleFonts.poppins(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: _kPrimary,
                                      ),
                                    ),
                                  ),
                          ],
                        ),
                      ),

                      // Divider
                      Container(
                        height: 70,
                        width: 1,
                        color: Colors.grey.shade100,
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                      ),

                      // Isi Saldo Button
                      _IsiSaldoButton(config: config),
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

// ─────────────────────────────────────────────
// Isi Saldo Button
// ─────────────────────────────────────────────
class _IsiSaldoButton extends StatelessWidget {
  const _IsiSaldoButton({required this.config});
  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Consumer<Beranda_provider>(
      builder: (context, data, _) {
        final isDisabled = data.status_deposit == true;
        return GestureDetector(
          onTap: isDisabled
              ? null
              : () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => Form_input_deposit()),
                  ),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: isDisabled
                  ? null
                  : const LinearGradient(
                      colors: [_kPrimary, _kPrimaryLight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
              color: isDisabled ? Colors.grey.shade100 : null,
              borderRadius: BorderRadius.circular(14),
              boxShadow: isDisabled
                  ? []
                  : [
                      BoxShadow(
                        color: _kPrimary.withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
            ),
            child: Column(
              children: [
                Icon(
                  TablerIcons.circle_plus,
                  size: 22,
                  color: isDisabled ? Colors.grey.shade400 : Colors.white,
                ),
                const SizedBox(height: 6),
                Text(
                  'Isi Saldo',
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isDisabled ? Colors.grey.shade400 : Colors.white,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.icon});
  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: _kPrimary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: _kPrimary, size: 16),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1A1A2E),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────
// Responsive Menu Grid
// ─────────────────────────────────────────────
class _MenuGrid extends StatelessWidget {
  const _MenuGrid({
    required this.config,
    required this.loader,
    required this.items,
  });

  final ConfigApp config;
  final Load_provider loader;
  final List<_MenuItemData> items;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Responsive columns: 4 kolom untuk phone, 6 untuk tablet
        final cols = constraints.maxWidth > 600 ? 6 : 4;
        final itemWidth = constraints.maxWidth / cols;

        return Wrap(
          children: items
              .map((item) => SizedBox(
                    width: itemWidth,
                    child: _BoxProduk(
                      config: config,
                      item: item,
                      loader: loader,
                    ),
                  ))
              .toList(),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────
// Menu Item Card
// ─────────────────────────────────────────────
class _BoxProduk extends StatelessWidget {
  const _BoxProduk({
    required this.config,
    required this.item,
    required this.loader,
  });

  final ConfigApp config;
  final _MenuItemData item;
  final Load_provider loader;

  void _navigate(BuildContext context) {
    if (item.tipe == 'prabayar') {
      final directInput = ['PIU', 'PT', 'PD', 'PTP', 'PS', 'TLOF'];
      if (directInput.contains(item.path)) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => Input_ppob(
              label: item.label,
              title: item.title,
              path: item.path,
              tipe: item.tipe,
              checkPrefix: (item.path == 'TLOF' ? false : true),
            ),
          ),
        );
      } else {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => Daftar_kategori(
              label: item.label,
              title: item.title,
              path: item.path,
              tipe: item.tipe,
            ),
          ),
        );
      }
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => Daftar_kategori_pascabayar(
            label: item.label,
            title: item.title,
            path: item.path,
            tipe: item.tipe,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _navigate(context),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon Box
            loader.isLoad == true
                ? _ShimmerBox(width: 52, height: 52, radius: 16)
                : TweenAnimationBuilder<double>(
                    tween: Tween(begin: 1.0, end: 1.0),
                    duration: const Duration(milliseconds: 150),
                    builder: (_, v, child) => child!,
                    child: Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: _kPrimary.withOpacity(0.08),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                        border: Border.all(
                          color: Colors.grey.shade100,
                          width: 1,
                        ),
                      ),
                      child: Icon(
                        item.icon,
                        color: _kPrimary,
                        size: 24,
                      ),
                    ),
                  ),

            const SizedBox(height: 8),

            // Label
            loader.isLoad == true
                ? _ShimmerBox(width: 38, height: 8, radius: 4)
                : Text(
                    item.label,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      height: 1.3,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF2D3748),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Shimmer / Skeleton Box
// ─────────────────────────────────────────────
class _ShimmerBox extends StatefulWidget {
  const _ShimmerBox(
      {required this.width, required this.height, this.radius = 6});
  final double width;
  final double height;
  final double radius;

  @override
  State<_ShimmerBox> createState() => _ShimmerBoxState();
}

class _ShimmerBoxState extends State<_ShimmerBox>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _anim,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(widget.radius),
        ),
      ),
    );
  }
}
