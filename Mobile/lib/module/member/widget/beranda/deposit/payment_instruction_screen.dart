import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:outletpulsa/services/deposit.dart';

class PaymentInstructionScreen extends StatefulWidget {
  final Map<String, dynamic> transactionData;

  const PaymentInstructionScreen({super.key, required this.transactionData});

  @override
  State<PaymentInstructionScreen> createState() => _PaymentInstructionScreenState();
}

class _PaymentInstructionScreenState extends State<PaymentInstructionScreen> {
  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  late Map<String, dynamic> _data;
  Timer? _pollingTimer;
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    _data = Map<String, dynamic>.from(widget.transactionData);
    _startPollingIfNeeded();
  }

  void _startPollingIfNeeded() {
    final status = (_data['status'] ?? '').toString().toUpperCase();
    if (status == 'SUCCESS' || status == 'FAILED' || status == 'EXPIRED') {
      return;
    }
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      _checkStatus(isAuto: true);
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _checkStatus({bool isAuto = false}) async {
    final txId = _data['transaction_id'] ?? _data['partner_reff'] ?? _data['id'];
    if (txId == null) return;

    if (!isAuto) {
      setState(() => _isChecking = true);
    }

    try {
      final res = await Rest_deposit().getPaymentGatewayDetail(txId.toString());
      final resData = res.data;
      if (mounted && res.error == false && resData != null) {
        setState(() {
          _data = Map<String, dynamic>.from(resData);
          _isChecking = false;
        });

        final newStatus = (_data['status'] ?? '').toString().toUpperCase();
        if (newStatus == 'SUCCESS' || newStatus == 'FAILED' || newStatus == 'EXPIRED') {
          _pollingTimer?.cancel();
        }
        if (!isAuto) {
          _showSnackBar(
            newStatus == 'SUCCESS'
                ? 'Pembayaran berhasil diverifikasi!'
                : 'Status pembayaran: $newStatus',
            isSuccess: newStatus == 'SUCCESS',
          );
        }
      } else {
        if (mounted && !isAuto) {
          setState(() => _isChecking = false);
          _showSnackBar(res.errorMsg ?? 'Gagal memeriksa status pembayaran', isSuccess: false);
        }
      }
    } catch (_) {
      if (mounted && !isAuto) {
        setState(() => _isChecking = false);
        _showSnackBar('Terjadi kesalahan saat memeriksa status', isSuccess: false);
      }
    }
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    _showSnackBar('$label berhasil disalin', isSuccess: true);
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
        backgroundColor: isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      _showSnackBar('Tidak dapat membuka link e-wallet', isSuccess: false);
    }
  }

  String _formatCurrency(dynamic amount) {
    try {
      final val = amount is num ? amount.toDouble() : double.parse(amount.toString());
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (_) {
      return 'Rp ${amount ?? 0}';
    }
  }

  String _formatDateTime(dynamic dt) {
    if (dt == null) return '-';
    try {
      DateTime parsed = dt is DateTime ? dt : DateTime.parse(dt.toString()).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(parsed) + ' WIB';
    } catch (_) {
      return dt.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final method = (_data['payment_method'] ?? '').toString().toUpperCase();
    final status = (_data['status'] ?? 'PENDING').toString().toUpperCase();
    final isQris = method == 'QRIS';
    final isEwallet = method == 'EWALLET';
    final isVa = method == 'VA';

    final isSuccess = status == 'SUCCESS';
    final isFailed = status == 'FAILED';
    final isExpired = status == 'EXPIRED';

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        backgroundColor: _kPrimary,
        title: Text('Instruksi Pembayaran', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.w600)),
        elevation: 0,
        actions: [
          IconButton(
            icon: _isChecking
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(TablerIcons.refresh, color: Colors.white),
            tooltip: 'Cek Status',
            onPressed: _isChecking ? null : () => _checkStatus(isAuto: false),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Status Header Banner
            _buildStatusBanner(status, isSuccess, isFailed, isExpired),
            const SizedBox(height: 16),

            // Main Payment Details Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 15, offset: const Offset(0, 5)),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    'Total Tagihan Pembayaran',
                    style: GoogleFonts.poppins(color: const Color(0xFF8898AA), fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _formatCurrency(_data['total_amount']),
                    style: GoogleFonts.outfit(fontSize: 30, fontWeight: FontWeight.w800, color: _kPrimary),
                  ),
                  const SizedBox(height: 20),

                  // Breakdown detail
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F9FA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      children: [
                        _buildBreakdownRow('Nominal Saldo', _formatCurrency(_data['amount'])),
                        const SizedBox(height: 8),
                        _buildBreakdownRow('Biaya Admin', _formatCurrency(_data['fee_admin'] ?? 0)),
                        const Divider(height: 16),
                        _buildBreakdownRow('Total Bayar', _formatCurrency(_data['total_amount']), isBold: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Method specific body
                  if (isVa) _buildVaSection(),
                  if (isQris) _buildQrisSection(),
                  if (isEwallet) _buildEwalletSection(),

                  const SizedBox(height: 20),
                  // Expiration row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(TablerIcons.clock, size: 16, color: isExpired ? Colors.red : Colors.grey.shade600),
                      const SizedBox(width: 6),
                      Text(
                        'Batas Bayar: ${_formatDateTime(_data['expired_at'])}',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          color: isExpired ? Colors.red : Colors.grey.shade700,
                          fontWeight: isExpired ? FontWeight.bold : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Action Buttons
            if (!isSuccess && !isFailed && !isExpired)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isChecking ? null : () => _checkStatus(isAuto: false),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _kPrimaryLight,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 2,
                  ),
                  icon: _isChecking
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(TablerIcons.refresh, color: Colors.white, size: 20),
                  label: Text(
                    _isChecking ? 'Memeriksa...' : 'Cek Status Pembayaran',
                    style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),

            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: _kPrimary, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  'Kembali ke Beranda',
                  style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: _kPrimary),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner(String status, bool isSuccess, bool isFailed, bool isExpired) {
    Color bg = const Color(0xFFFEF3C7);
    Color border = const Color(0xFFFCD34D);
    Color textColor = const Color(0xFF92400E);
    IconData icon = TablerIcons.clock;
    String title = 'Menunggu Pembayaran';
    String desc = 'Silakan selesaikan pembayaran sesuai instruksi di bawah ini.';

    if (isSuccess) {
      bg = const Color(0xFFDCFCE7);
      border = const Color(0xFF86EFAC);
      textColor = const Color(0xFF166534);
      icon = TablerIcons.circle_check;
      title = 'Pembayaran Berhasil!';
      desc = 'Saldo deposit telah ditambahkan ke akun Anda.';
    } else if (isFailed) {
      bg = const Color(0xFFFEE2E2);
      border = const Color(0xFFFCA5A5);
      textColor = const Color(0xFF991B1B);
      icon = TablerIcons.circle_x;
      title = 'Pembayaran Gagal';
      desc = 'Transaksi pembayaran tidak dapat diproses atau dibatalkan.';
    } else if (isExpired) {
      bg = const Color(0xFFF3F4F6);
      border = const Color(0xFFE5E7EB);
      textColor = const Color(0xFF4B5563);
      icon = TablerIcons.alert_triangle;
      title = 'Tagihan Kedaluwarsa';
      desc = 'Waktu pembayaran telah habis. Silakan buat deposit baru.';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: textColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 2),
                Text(desc, style: GoogleFonts.poppins(fontSize: 12, color: textColor.withOpacity(0.9))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: isBold ? const Color(0xFF1A1A2E) : const Color(0xFF6B7280),
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w400,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: isBold ? 14 : 13,
            color: isBold ? _kPrimary : const Color(0xFF1A1A2E),
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildVaSection() {
    final vaNumber = _data['virtual_account'] ?? '-';
    final bankName = _data['bank_name'] ?? _data['bank_code'] ?? 'Virtual Account';

    return Column(
      children: [
        Text('Bank Transfer (Virtual Account)', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text('Bank $bankName', style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade600)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8F9FA),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  vaNumber,
                  style: GoogleFonts.poppins(fontSize: 19, fontWeight: FontWeight.w800, letterSpacing: 1.5, color: const Color(0xFF1A1A2E)),
                ),
              ),
              IconButton(
                icon: const Icon(TablerIcons.copy, color: _kPrimary),
                tooltip: 'Salin Nomor VA',
                onPressed: () => _copyToClipboard(vaNumber, 'Nomor Virtual Account'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQrisSection() {
    final imageQris = _data['imageqris'];
    final qrisText = _data['qris_text'];

    return Column(
      children: [
        Text('Scan Kode QRIS', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        if (imageQris != null && imageQris.toString().isNotEmpty)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Image.network(
              imageQris.toString(),
              width: 230,
              height: 230,
              fit: BoxFit.contain,
              errorBuilder: (ctx, err, stack) => _buildQrisTextFallback(qrisText),
            ),
          )
        else
          _buildQrisTextFallback(qrisText),
      ],
    );
  }

  Widget _buildQrisTextFallback(dynamic qrisText) {
    final text = qrisText?.toString() ?? '';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        children: [
          const Icon(TablerIcons.qrcode, size: 48, color: _kPrimary),
          const SizedBox(height: 10),
          Text(
            'Kode QRIS Digital',
            style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            text.isNotEmpty ? text : 'Kode QRIS tidak tersedia. Silakan gunakan metode transfer VA.',
            textAlign: TextAlign.center,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.poppins(fontSize: 11, color: Colors.grey.shade700),
          ),
          if (text.isNotEmpty) ...[
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => _copyToClipboard(text, 'Kode QRIS'),
              icon: const Icon(TablerIcons.copy, size: 16, color: Colors.white),
              label: Text('Salin Kode QRIS', style: GoogleFonts.poppins(fontSize: 12, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _kPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEwalletSection() {
    final checkoutUrl = _data['checkout_url'];

    return Column(
      children: [
        Text('Pembayaran E-Wallet', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        if (checkoutUrl != null && checkoutUrl.toString().isNotEmpty) ...[
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: _kPrimary,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () => _launchUrl(checkoutUrl.toString()),
            icon: const Icon(TablerIcons.external_link, color: Colors.white),
            label: Text('Buka Aplikasi E-Wallet', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
          const SizedBox(height: 12),
          Text(
            'Setelah menyelesaikan pembayaran di aplikasi E-Wallet, kembali ke layar ini lalu tekan "Cek Status Pembayaran".',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600),
          ),
        ] else ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
              children: [
                const Icon(TablerIcons.bell_ringing, color: _kPrimary, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Notifikasi pembayaran telah dikirim ke nomor HP Anda. Buka aplikasi E-Wallet Anda untuk konfirmasi.',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade700),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
