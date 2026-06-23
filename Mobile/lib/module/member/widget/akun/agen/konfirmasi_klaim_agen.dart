import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/AgenProvider.dart';
import 'package:intl/intl.dart';

class KonfirmasiKlaimAgen extends StatefulWidget {
  final int totalKlaim;

  const KonfirmasiKlaimAgen({Key? key, required this.totalKlaim})
      : super(key: key);

  @override
  State<KonfirmasiKlaimAgen> createState() => _KonfirmasiKlaimAgenState();
}

class _KonfirmasiKlaimAgenState extends State<KonfirmasiKlaimAgen>
    with SingleTickerProviderStateMixin {
  static const double _kWideBreakpoint = 700.0;
  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  bool _isLoading = false;

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
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim =
        Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  String formatCurrency(dynamic number) {
    if (number == null) return 'Rp 0';
    final formatter =
        NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(number);
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor:
            isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Icon(
              isSuccess
                  ? TablerIcons.circle_check
                  : TablerIcons.alert_circle,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style:
                    GoogleFonts.poppins(fontSize: 13, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  Future<void> _submitKlaim() async {
    setState(() => _isLoading = true);

    final agenProv = Provider.of<Agen_provider>(context, listen: false);
    final berandaProv = Provider.of<Beranda_provider>(context, listen: false);

    await agenProv.klaimFeeAgen(berandaProv); // refresh saldo & statistik terintegrasi

    if (!mounted) return;

    setState(() => _isLoading = false);

    if (agenProv.error == false) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(TablerIcons.circle_check_filled,
                  color: Colors.green, size: 80),
              const SizedBox(height: 16),
              Text(
                'Klaim Berhasil!',
                style: GoogleFonts.poppins(
                    fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                agenProv.errorMsg ?? 'Saldo keagenan berhasil dicairkan.',
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.pop(context); // close dialog
                    Navigator.pop(context); // back to info keagenan
                  },
                  child: Text(
                    'Kembali',
                    style: GoogleFonts.poppins(
                        color: Colors.white, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    } else {
      _showSnackBar(agenProv.errorMsg ?? 'Gagal klaim saldo.',
          isSuccess: false);
    }
  }

  // ─── Brand Panel ─────────────────────────────────────────────────────────────

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
                top: -50,
                right: -50,
                child: _Circle(size: 200, opacity: 0.05)),
            Positioned(
                top: 50,
                right: 50,
                child: _Circle(size: 90, opacity: 0.06)),
            Positioned(
                bottom: -40,
                left: -40,
                child: _Circle(size: 130, opacity: 0.04)),

            // Back button
            Positioned(
              top: compact ? 0 : 16,
              left: compact ? 0 : 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  margin:
                      compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(TablerIcons.arrow_left,
                      color: Colors.white, size: 20),
                ),
              ),
            ),

            // Center content
            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(
                    horizontal: 32, vertical: compact ? 48 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                            width: 1.5),
                      ),
                      child: const Icon(TablerIcons.cash,
                          size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Konfirmasi\nPencairan',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Pastikan nominal pencairan sudah benar sebelum melanjutkan',
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

  // ─── Data Row ────────────────────────────────────────────────────────────────

  Widget _buildDataRow(String label, String value,
      {Color? valueColor, FontWeight? valueFontWeight}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.poppins(
                fontSize: 15,
                fontWeight: valueFontWeight ?? FontWeight.w700,
                color: valueColor ?? const Color(0xFF1A1A2E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Form Card ───────────────────────────────────────────────────────────────

  Widget _buildFormCard({bool isWide = false}) {
    return Container(
      padding: EdgeInsets.all(isWide ? 40 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: isWide
            ? [
                BoxShadow(
                  color: _kPrimary.withOpacity(0.08),
                  blurRadius: 40,
                  offset: const Offset(0, 15),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title
          Row(
            children: [
              Icon(TablerIcons.cash,
                  color: _kPrimary.withOpacity(0.7), size: 20),
              const SizedBox(width: 8),
              Text(
                'Detail Pencairan',
                style: GoogleFonts.poppins(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: _kPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.grey.withOpacity(0.2)),
          const SizedBox(height: 8),

          // Nominal row
          _buildDataRow(
            'Nominal Pencairan',
            formatCurrency(widget.totalKlaim),
            valueColor: _kPrimary,
            valueFontWeight: FontWeight.w800,
          ),
          Divider(color: Colors.grey.withOpacity(0.15)),

          // Destination row
          _buildDataRow('Tujuan', 'Saldo Utama'),
          Divider(color: Colors.grey.withOpacity(0.15)),

          // Status row
          _buildDataRow('Status', 'Proses Instan'),

          const SizedBox(height: 20),

          // Info box
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _kPrimary.withOpacity(0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color: _kPrimary.withOpacity(0.12), width: 1),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(TablerIcons.info_circle,
                    color: _kPrimary.withOpacity(0.7), size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Pencairan akan ditambahkan ke saldo utama Anda dan diproses secara instan.',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: _kPrimary.withOpacity(0.75),
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 36),

          // Submit button
          GestureDetector(
            onTap: _isLoading ? null : _submitKlaim,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _isLoading
                      ? [Colors.grey.shade400, Colors.grey.shade500]
                      : [_kPrimary, _kPrimaryLight],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: _isLoading
                    ? null
                    : [
                        BoxShadow(
                          color: _kPrimary.withOpacity(0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_isLoading)
                    const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  else
                    const Icon(TablerIcons.check,
                        size: 22, color: Colors.white),
                  const SizedBox(width: 10),
                  Text(
                    _isLoading ? 'Memproses...' : 'Konfirmasi Pencairan',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final bool isWide = constraints.maxWidth >= _kWideBreakpoint;

          if (isWide) {
            return Row(
              children: [
                Expanded(flex: 5, child: _buildBrandPanel()),
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
                              child: _buildFormCard(isWide: true),
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

          return SafeArea(
            top: false,
            child: LayoutBuilder(
              builder: (context, safeConstraints) {
                return SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: ConstrainedBox(
                    constraints:
                        BoxConstraints(minHeight: safeConstraints.maxHeight),
                    child: IntrinsicHeight(
                      child: FadeTransition(
                        opacity: _fadeAnim,
                        child: SlideTransition(
                          position: _slideAnim,
                          child: Column(
                            children: [
                              _buildBrandPanel(compact: true),
                              Expanded(
                                child: Container(
                                  width: double.infinity,
                                  color: const Color(0xFFF0F2F8),
                                  child: Column(
                                    children: [
                                      Transform.translate(
                                        offset: const Offset(0, -30),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20),
                                          child: Container(
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(28),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: _kPrimary
                                                      .withOpacity(0.08),
                                                  blurRadius: 30,
                                                  offset:
                                                      const Offset(0, 10),
                                                ),
                                              ],
                                            ),
                                            child: _buildFormCard(),
                                          ),
                                        ),
                                      ),
                                      const Spacer(),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

// ─── Helper Widget ────────────────────────────────────────────────────────────

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
