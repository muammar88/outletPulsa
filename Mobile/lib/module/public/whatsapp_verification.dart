import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

const _kPrimary = Color(0xFF0F1F6E);
const _kPrimaryLight = Color(0xFF1A3DB5);
const _kWhatsappGreen = Color(0xFF25D366);

/// Breakpoint untuk wide layout
const _kWideBreakpoint = 700.0;

class WhatsappVerificationPage extends StatefulWidget {
  final String verificationCode;
  final String botWhatsapp;

  const WhatsappVerificationPage({
    super.key,
    required this.verificationCode,
    required this.botWhatsapp,
  });

  @override
  State<WhatsappVerificationPage> createState() =>
      _WhatsappVerificationPageState();
}

class _WhatsappVerificationPageState extends State<WhatsappVerificationPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim =
        Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _openWhatsapp() async {
    final url = Uri.parse(
        'https://wa.me/${widget.botWhatsapp}?text=${widget.verificationCode}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tidak dapat membuka WhatsApp')),
        );
      }
    }
  }

  // ─── Brand Panel ─────────────────────────────────────────
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
            // Dekorasi lingkaran
            Positioned(
                top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(
                top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(
                bottom: -40, left: -40, child: _Circle(size: 130, opacity: 0.04)),

            Center(
              child: Padding(
                padding: EdgeInsets.all(compact ? 24.0 : 48.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: EdgeInsets.all(compact ? 12 : 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(compact ? 18 : 24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Icon(
                        TablerIcons.brand_whatsapp,
                        color: _kWhatsappGreen,
                        size: compact ? 52 : 72,
                      ),
                    ),
                    SizedBox(height: compact ? 20 : 32),
                    Text(
                      'Verifikasi WhatsApp',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 22 : 32,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Langkah terakhir untuk mengaktifkan akun Anda',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 12 : 14,
                        color: Colors.white70,
                        height: 1.5,
                      ),
                    ),
                    SizedBox(height: compact ? 40 : 48), // Memberikan jarak ekstra di bawah teks agar tidak tertimpa kartu
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Verification Card ───────────────────────────────────
  Widget _buildVerificationCard({bool isWide = false}) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(maxWidth: isWide ? 420 : 480),
      padding: EdgeInsets.fromLTRB(
          isWide ? 40 : 24, isWide ? 40 : 32, isWide ? 40 : 24, 32),
      decoration: isWide
          ? null
          : BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: _kPrimary.withOpacity(0.12),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Kirim Kode Verifikasi',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Silakan klik tombol di bawah ini untuk mengirimkan kode unik Anda secara otomatis ke WhatsApp resmi kami.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 13,
              color: Colors.grey.shade600,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 28),
          
          const SizedBox(height: 12),

          // Send Button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: _kWhatsappGreen,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: _kWhatsappGreen.withOpacity(0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: _openWhatsapp,
                icon: const Icon(TablerIcons.send, color: Colors.white, size: 20),
                label: Text(
                  'Kirim via WhatsApp',
                  style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Back to login
          GestureDetector(
            onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
            child: Text(
              'Kembali ke Halaman Login',
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: _kPrimaryLight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: const Color(0xFFF0F2F8),
        body: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= _kWideBreakpoint;

            // ── WIDE LAYOUT ───────────────────
            if (isWide) {
              return Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: _buildBrandPanel(),
                  ),
                  Expanded(
                    flex: 6,
                    child: Container(
                      color: Colors.white,
                      child: SafeArea(
                        child: Center(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 48, vertical: 32),
                            physics: const BouncingScrollPhysics(),
                            child: FadeTransition(
                              opacity: _fadeAnim,
                              child: SlideTransition(
                                position: _slideAnim,
                                child: _buildVerificationCard(isWide: true),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            }

            // ── NARROW LAYOUT ─────────────────
            return SafeArea(
              top: false,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Column(
                      children: [
                        _buildBrandPanel(compact: true),
                        Container(
                          color: const Color(0xFFF0F2F8),
                          padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                          child: Transform.translate(
                            offset: const Offset(0, -30),
                            child: _buildVerificationCard(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Shared Widgets
// ─────────────────────────────────────────────
class _Circle extends StatelessWidget {
  const _Circle({required this.size, required this.opacity});
  final double size;
  final double opacity;
  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(opacity),
        ),
      );
}
