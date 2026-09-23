import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/DepositProvider.dart';
import 'package:outletpulsa/module/member/widget/beranda/deposit/payment_instruction_screen.dart';

class Detail_deposit extends StatefulWidget {
  const Detail_deposit({super.key, required this.status, required this.id});

  final String status;
  final String id;

  @override
  State<Detail_deposit> createState() => _Detail_depositState();
}

class _Detail_depositState extends State<Detail_deposit> with SingleTickerProviderStateMixin {
  final config = ConfigApp();
  bool loadData = false;

  static const double _kWideBreakpoint = 700.0;
  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      loadData = true;

      await Provider.of<Deposit_provider>(context).getDetailDeposit(widget.id);
    }
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Icon(
              isSuccess ? TablerIcons.circle_check : TablerIcons.alert_circle,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message, style: GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  String _formatCurrency(String amount) {
    try {
      double val = double.parse(amount);
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  String _formatDate(String rawDate) {
    try {
      DateTime dt = DateTime.parse(rawDate).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(dt);
    } catch (e) {
      return rawDate;
    }
  }

  Widget _buildBrandPanel(Deposit_provider deposit, String s, {bool compact = false}) {
    return Container(
      width: double.infinity,
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
                onTap: () => Navigator.of(context).pop(),
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
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 40 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
                      ),
                      child: const Icon(
                        TablerIcons.receipt, 
                        size: 40, 
                        color: Colors.white
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Detail\nDeposit',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Rincian deposit saldo akun Anda',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 13 : 15,
                        color: Colors.white.withOpacity(0.85),
                        height: 1.5,
                      ),
                    ),
                    if (compact) const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isCopy = false, String? rawCopyValue, bool isStatus = false, Color? statusColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF8898AA),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: isStatus
                ? Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor?.withOpacity(0.1) ?? Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: statusColor?.withOpacity(0.3) ?? Colors.grey.shade300),
                      ),
                      child: Text(
                        value,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: statusColor ?? Colors.grey.shade700,
                        ),
                      ),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Flexible(
                        child: Text(
                          value,
                          textAlign: TextAlign.right,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                      ),
                      if (isCopy) ...[
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () async {
                            final textToCopy = rawCopyValue ?? value;
                            await Clipboard.setData(ClipboardData(text: textToCopy));
                            _showSnackBar('Berhasil disalin: $textToCopy', isSuccess: true);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0F2F8),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Icon(TablerIcons.copy, size: 16, color: _kPrimary),
                          ),
                        ),
                      ]
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentCard(Deposit_provider deposit, String statusName, Color statusColor, IconData statusIcon, {bool isWide = false}) {
    return Container(
      padding: EdgeInsets.all(isWide ? 40 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: isWide
            ? [BoxShadow(color: _kPrimary.withOpacity(0.08), blurRadius: 40, offset: const Offset(0, 15))]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Column(
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: statusColor.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(statusIcon, color: Colors.white, size: 28),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  statusName,
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1A1A2E),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _formatDate(deposit.waktu_kirim ?? ''),
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: const Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                _buildDetailRow('Kode Transaksi', '#${deposit.kode ?? '-'}', isCopy: true),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Nominal Deposit', _formatCurrency(deposit.nominal ?? '0'), isCopy: true, rawCopyValue: deposit.nominal ?? '0'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Metode Pembayaran', 'Transfer Bank'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Bank Tujuan', deposit.bank_tujuan_transfer ?? '-'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Nama Rekening', deposit.nama_akun ?? '-'),
                Divider(color: Colors.grey.shade200, height: 1),
                _buildDetailRow('Nomor Rekening', deposit.nomor_rekening_akun ?? '-', isCopy: true),
              ],
            ),
          ),
          
          if (deposit.status_deposit?.toLowerCase() == 'gagal') ...[
            const SizedBox(height: 24),
            Text(
              'Informasi Penolakan',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFCA5A5)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(TablerIcons.alert_circle, color: Color(0xFFDC2626), size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Alasan Penolakan:',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF991B1B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          deposit.alasan_penolakan ?? '-',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: const Color(0xFF991B1B),
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Silahkan hubungi admin melalui WA: 085262802141',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFFDC2626),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: 36),
          Column(
            children: [
              if (deposit.payment_gateway != null && (deposit.status_deposit?.toLowerCase() == 'proses' || deposit.payment_gateway?['status']?.toString().toUpperCase() == 'PENDING')) ...[
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PaymentInstructionScreen(
                            transactionData: deposit.payment_gateway!,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(TablerIcons.receipt_2, color: Colors.white, size: 20),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2E7D32),
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                      shadowColor: const Color(0xFF2E7D32).withOpacity(0.4),
                    ),
                    label: Text(
                      "LIHAT INSTRUKSI PEMBAYARAN",
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                    shadowColor: _kPrimary.withOpacity(0.4),
                  ),
                  child: Text(
                    "KEMBALI KE BERANDA",
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: CircularProgressIndicator(color: _kPrimary),
    );
  }

  Widget _buildErrorState(String errorMsg) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(TablerIcons.alert_triangle, color: Colors.red, size: 60),
            const SizedBox(height: 16),
            Text(
              errorMsg,
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: Colors.red, fontSize: 16),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(backgroundColor: _kPrimary),
              child: Text('Kembali', style: GoogleFonts.poppins(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final deposit = Provider.of<Deposit_provider>(context);
    final s = (deposit.status_deposit ?? widget.status).toLowerCase();
    
    Color statusColor;
    IconData statusIcon;
    String statusTitle;

    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFDC2626);
      statusIcon = TablerIcons.x;
      statusTitle = 'Deposit Gagal';
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF59E0B);
      statusIcon = TablerIcons.clock;
      statusTitle = 'Deposit Diproses';
    } else {
      statusColor = const Color(0xFF10B981);
      statusIcon = TablerIcons.check;
      statusTitle = 'Deposit Berhasil';
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Stack(
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              bool isWide = constraints.maxWidth >= _kWideBreakpoint;

              if (isWide) {
                return Row(
                  children: [
                    Expanded(flex: 5, child: _buildBrandPanel(deposit, s)),
                    Expanded(
                      flex: 6,
                      child: Container(
                        color: Colors.white,
                        child: SafeArea(
                          child: Center(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
                              physics: const BouncingScrollPhysics(),
                              child: FadeTransition(
                                opacity: _fadeAnim,
                                child: SlideTransition(
                                  position: _slideAnim,
                                  child: (loadData && deposit.kode == null && deposit.error == true)
                                      ? _buildErrorState(deposit.errorMsg ?? 'Gagal memuat detail')
                                      : (!loadData || deposit.kode == null)
                                          ? _buildLoadingState()
                                          : _buildContentCard(deposit, statusTitle, statusColor, statusIcon, isWide: true),
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
                        constraints: BoxConstraints(minHeight: safeConstraints.maxHeight),
                        child: IntrinsicHeight(
                          child: FadeTransition(
                            opacity: _fadeAnim,
                            child: SlideTransition(
                              position: _slideAnim,
                              child: Column(
                                children: [
                                  _buildBrandPanel(deposit, s, compact: true),
                                  Expanded(
                                    child: Container(
                                      width: double.infinity,
                                      color: const Color(0xFFF0F2F8),
                                      child: (loadData && deposit.kode == null && deposit.error == true)
                                          ? _buildErrorState(deposit.errorMsg ?? 'Gagal memuat detail')
                                          : (!loadData || deposit.kode == null)
                                              ? _buildLoadingState()
                                              : Column(
                                                  children: [
                                                    Transform.translate(
                                                      offset: const Offset(0, -30),
                                                      child: Padding(
                                                        padding: const EdgeInsets.symmetric(horizontal: 20),
                                                        child: Container(
                                                          decoration: BoxDecoration(
                                                            color: Colors.white,
                                                            borderRadius: BorderRadius.circular(28),
                                                            boxShadow: [
                                                              BoxShadow(
                                                                color: _kPrimary.withOpacity(0.08),
                                                                blurRadius: 30,
                                                                offset: const Offset(0, 10),
                                                              ),
                                                            ],
                                                          ),
                                                          child: _buildContentCard(deposit, statusTitle, statusColor, statusIcon),
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
