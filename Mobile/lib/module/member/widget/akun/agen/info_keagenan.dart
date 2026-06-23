import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/AgenProvider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/widgets/skeletonWidget.dart';
import 'package:intl/intl.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/konfirmasi_klaim_agen.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/daftar_reseller_agen.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/daftar_transaksi_reseller.dart';

class Info_keagenan extends StatefulWidget {
  const Info_keagenan({super.key});

  @override
  State<Info_keagenan> createState() => _Info_keagenanState();
}

class _Info_keagenanState extends State<Info_keagenan> {
  final config = ConfigApp();
  bool loadData = false;

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      final agenProv = Provider.of<Agen_provider>(context, listen: false);
      // Panggil API Statistik
      await agenProv.getStatistikAgen();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  String formatCurrency(dynamic number) {
    if (number == null) return 'Rp 0';
    final formatter =
        NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(number);
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
                    horizontal: 32, vertical: compact ? 24 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      "Info Keagenan",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 24 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Statistik & Performa Jaringan',
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

  Widget _buildHighlightCard(
      String title, String value, IconData icon, List<Color> gradient,
      {Widget? actionButton}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: gradient[0].withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 13,
                          fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      value,
                      style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (actionButton != null) ...[
            const SizedBox(height: 16),
            actionButton!,
          ]
        ],
      ),
    );
  }

  Widget _buildNetworkStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required String badge,
    VoidCallback? onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.10),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
            border: Border.all(color: color.withOpacity(0.12), width: 1.2),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Stack(
              children: [
                // Top accent bar
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 4,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [color, color.withOpacity(0.4)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                    ),
                  ),
                ),

                // Card Content
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon + Arrow
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.10),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(icon, color: color, size: 22),
                          ),
                          if (onTap != null)
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.08),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(TablerIcons.arrow_up_right,
                                  color: color, size: 14),
                            ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Value
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          value,
                          style: GoogleFonts.outfit(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: color,
                            height: 1.1,
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Title
                      Text(
                        title,
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A2E),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      const SizedBox(height: 10),

                      // Badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          badge,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: color,
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

  @override
  Widget build(BuildContext context) {
    final dataBeranda = Provider.of<Beranda_provider>(context);
    final agenProv = Provider.of<Agen_provider>(context);

    // Keamanan / Validasi routing
    if (!dataBeranda.isAgen) {
      return Scaffold(
        backgroundColor: const Color(0xFFF0F2F8),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(TablerIcons.arrow_left, color: Colors.black87),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            'Akses Ditolak',
            style: GoogleFonts.poppins(
                color: Colors.black87, fontWeight: FontWeight.w600),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(TablerIcons.lock, size: 80, color: Colors.grey),
                const SizedBox(height: 24),
                Text(
                  'Akses Tidak Diizinkan',
                  style: GoogleFonts.poppins(
                      fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  'Halaman ini hanya dapat diakses oleh agen.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                      fontSize: 14, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final stat = agenProv.statistik;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Column(
        children: [
          _buildBrandPanel(compact: true),
          Expanded(
            child: stat == null
                ? ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      const SkeletonWidget(
                          height: 100, width: double.infinity, radius: 20),
                      const SizedBox(height: 16),
                      const SkeletonWidget(
                          height: 100, width: double.infinity, radius: 20),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                              child: const SkeletonWidget(
                                  height: 120,
                                  width: double.infinity,
                                  radius: 16)),
                          const SizedBox(width: 16),
                          Expanded(
                              child: const SkeletonWidget(
                                  height: 120,
                                  width: double.infinity,
                                  radius: 16)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                              child: const SkeletonWidget(
                                  height: 120,
                                  width: double.infinity,
                                  radius: 16)),
                          const SizedBox(width: 16),
                          Expanded(
                              child: const SkeletonWidget(
                                  height: 120,
                                  width: double.infinity,
                                  radius: 16)),
                        ],
                      )
                    ],
                  )
                : SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Highlight Cards
                        _buildHighlightCard(
                          'Saldo Keagenan Belum Diklaim',
                          formatCurrency(stat['saldo_keagenan_belum_diklaim']),
                          TablerIcons.wallet,
                          [const Color(0xFFE65100), const Color(0xFFFF9800)],
                          actionButton: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: (stat[
                                              'saldo_keagenan_belum_diklaim'] !=
                                          null &&
                                      stat['saldo_keagenan_belum_diklaim'] > 0)
                                  ? () => _handleClaim(agenProv, dataBeranda)
                                  : () {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(
                                              'Belum ada saldo keagenan yang dapat diklaim.',
                                              style: GoogleFonts.poppins()),
                                          backgroundColor: Colors.orange,
                                          behavior: SnackBarBehavior.floating,
                                        ),
                                      );
                                    },
                              icon: const Icon(TablerIcons.cash, size: 20),
                              label: const Text("Klaim Saldo Sekarang"),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white.withOpacity(0.2),
                                foregroundColor:
                                    (stat['saldo_keagenan_belum_diklaim'] !=
                                                null &&
                                            stat['saldo_keagenan_belum_diklaim'] >
                                                0)
                                        ? Colors.white
                                        : Colors.white.withOpacity(0.5),
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 14),
                                textStyle: GoogleFonts.poppins(
                                    fontSize: 14, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildHighlightCard(
                            'Saldo Agen Saat Ini',
                            formatCurrency(stat['saldo_agen_saat_ini']),
                            TablerIcons.coin,
                            [_kPrimary, _kPrimaryLight]),

                        const SizedBox(height: 24),
                        Text(
                          'Kinerja Jaringan',
                          style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1A1A2E)),
                        ),
                        const SizedBox(height: 16),

                        // Stacked Stats — 2-col Grid
                        IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              _buildNetworkStatCard(
                                title: 'Reseller\nAktif',
                                value: '${stat['total_reseller_aktif'] ?? 0}',
                                icon: TablerIcons.users,
                                color: const Color(0xFF0097A7),
                                badge: 'Lihat semua reseller',
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const Daftar_reseller_agen()),
                                ),
                              ),
                              const SizedBox(width: 14),
                              _buildNetworkStatCard(
                                title: 'Transaksi\nBelum Diklaim',
                                value:
                                    '${stat['total_transaksi_belum_diklaim'] ?? 0}',
                                icon: TablerIcons.receipt,
                                color: const Color(0xFF7B1FA2),
                                badge: 'Bisa diklaim',
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const Daftar_transaksi_reseller()),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _handleClaim(Agen_provider agenProv, Beranda_provider berandaProv) {
    int totalKlaim = agenProv.statistik?['saldo_keagenan_belum_diklaim'] ?? 0;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => KonfirmasiKlaimAgen(totalKlaim: totalKlaim),
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
