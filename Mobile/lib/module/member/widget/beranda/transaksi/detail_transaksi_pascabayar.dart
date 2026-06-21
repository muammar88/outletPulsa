import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:outletpulsa/core/utils/print_pascabayar.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/DetailPascabayarProvider.dart';
import 'package:outletpulsa/shared/providers/RiwayatPascabayarProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/shared/widgets/CircularProgressWidget.dart';

class Detail_transaksi_pascabayar extends StatefulWidget {
  Detail_transaksi_pascabayar({super.key, required this.kodeTrans});

  final String kodeTrans;

  @override
  State<Detail_transaksi_pascabayar> createState() =>
      _Detail_transaksi_pascabayarState();
}

class _Detail_transaksi_pascabayarState extends State<Detail_transaksi_pascabayar> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    final load = Provider.of<Load_provider>(context, listen: false);
    final details = Provider.of<Detail_pascabayar_provider>(context, listen: false);
    
    if (loadData == false) {
      Future.delayed(Duration.zero, () => load.isLoad = true);
      await details.detailTransaksiPascabayar(widget.kodeTrans);
      await Provider.of<Riwayat_pascabayar_provider>(context, listen: false).getRiwayatPascabayar();
      await Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
      loadData = true;
      load.isLoad = false;
    }
    super.didChangeDependencies();
  }

  String _formatCurrency(String amount) {
    try {
      final cleaned = amount.replaceAll(RegExp(r'[^0-9]'), '');
      if (cleaned.isEmpty) return amount;
      double val = double.parse(cleaned);
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = Provider.of<Detail_pascabayar_provider>(context);
    final s = (detail.status ?? '').toLowerCase();
    
    Color statusColor;
    IconData statusIcon;
    String statusTitle;

    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFE53935);
      statusIcon = TablerIcons.x;
      statusTitle = 'Transaksi Gagal';
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF9A825);
      statusIcon = TablerIcons.clock;
      statusTitle = 'Transaksi Diproses';
    } else {
      statusColor = const Color(0xFF43A047);
      statusIcon = TablerIcons.check;
      statusTitle = 'Transaksi Berhasil';
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF1A1A2E)),
        ),
        title: Text(
          'Detail Transaksi Pascabayar',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A2E),
          ),
        ),
        actions: [
          if (s == 'sukses' || s == 'berhasil')
            IconButton(
              icon: const Icon(
                TablerIcons.share,
                size: 22,
                color: Color(0xFF1A1A2E),
              ),
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: detail.message ?? ''));
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: const Color(0xFF1A1A2E),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle_outline, color: Colors.greenAccent),
                          const SizedBox(width: 10),
                          Text(
                            'Pesan disalin ke clipboard',
                            style: GoogleFonts.poppins(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  );
                }
              },
            ),
          const SizedBox(width: 8)
        ],
      ),
      body: Consumer<Load_provider>(
        builder: (context, loader, child) => Stack(
          children: [
            if (!loadData)
              const Center(child: CircularProgressIndicator())
            else
              SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  children: [
                    // Card Utama
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F1F6E).withOpacity(0.04),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          const SizedBox(height: 30),
                          // Icon Status
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
                            statusTitle,
                            style: GoogleFonts.outfit(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF1A1A2E),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            detail.dateTransaction ?? '-',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              color: const Color(0xFF6B7280),
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          // Nominal/Tujuan Section
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            decoration: const BoxDecoration(
                              color: Color(0xFFF8FAFC),
                              border: Border.symmetric(
                                horizontal: BorderSide(color: Color(0xFFEEF2F6)),
                              )
                            ),
                            child: Column(
                              children: [
                                Text(
                                  'Nomor Tujuan / Pelanggan',
                                  style: GoogleFonts.poppins(
                                    fontSize: 13,
                                    color: const Color(0xFF6B7280),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  detail.nomorTujuan ?? '-',
                                  style: GoogleFonts.outfit(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: config.background_color,
                                  ),
                                ),
                                if (detail.namaPelanggan != null && detail.namaPelanggan!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    detail.namaPelanggan!,
                                    style: GoogleFonts.poppins(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF1A1A2E),
                                    ),
                                  ),
                                ]
                              ],
                            ),
                          ),

                          const SizedBox(height: 10),
                          
                          // Detail List
                          Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              children: [
                                _buildDetailRow('ID Transaksi', '#${widget.kodeTrans}'),
                                _buildDetailRow('Kode Produk', detail.productName ?? '-'),
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Divider(color: Color(0xFFF3F4F6), height: 1),
                                ),
                                _buildDetailRow('Tagihan', _formatCurrency(detail.price ?? '0')),
                                _buildDetailRow('Biaya Admin', _formatCurrency(detail.biayaAdmin ?? '0')),
                                _buildDetailRow('Fee', _formatCurrency(detail.fee ?? '0')),
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Divider(color: Color(0xFFF3F4F6), height: 1),
                                ),
                                _buildDetailRow('Total Tagihan', _formatCurrency(detail.totalPrice ?? '0')),
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Divider(color: Color(0xFFF3F4F6), height: 1),
                                ),
                                _buildDetailCol('Pesan Sistem', detail.message ?? '-'),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 30),
                    
                    // Tombol Print
                    if (s == 'sukses')
                      _buildActionButton(
                        icon: TablerIcons.printer,
                        label: 'Cetak Struk',
                        color: config.background_color,
                        bgColor: Colors.white,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PrintPascabayar(
                                kodeTrans: widget.kodeTrans,
                              ),
                            ),
                          );
                        },
                      ),
                    
                    if (s == 'sukses')
                      const SizedBox(height: 16),

                    // Tombol OK
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: config.background_color,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        onPressed: () {
                          Navigator.of(context).popUntil((route) => route.isFirst);
                        },
                        child: Text(
                          'Kembali ke Beranda',
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            
            if (loader.isLoad == true)
              const CircularProgressWidget(),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required Color bgColor,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: OutlinedButton.icon(
        style: OutlinedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: color,
          side: BorderSide(color: color.withOpacity(0.3)),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        icon: Icon(icon, size: 20),
        label: Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
        onPressed: onPressed,
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isCopyable = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF6B7280),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1A1A2E),
                    ),
                  ),
                ),
                if (isCopyable) ...[
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () async {
                      await Clipboard.setData(ClipboardData(text: value));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: const Color(0xFF1A1A2E),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle_outline, color: Colors.greenAccent),
                                const SizedBox(width: 10),
                                Text(
                                  'Tersalin: $value',
                                  style: GoogleFonts.poppins(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                    },
                    child: const Icon(
                      TablerIcons.copy,
                      size: 18,
                      color: Color(0xFF1565C0),
                    ),
                  )
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCol(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF6B7280),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: const Color(0xFF1A1A2E),
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
