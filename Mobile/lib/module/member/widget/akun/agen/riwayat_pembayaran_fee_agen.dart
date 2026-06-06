import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/AgenProvider.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/allBoxLoading.dart';

class Riwayat_pembayaran_fee_agen extends StatefulWidget {
  const Riwayat_pembayaran_fee_agen({super.key});

  @override
  State<Riwayat_pembayaran_fee_agen> createState() =>
      _Riwayat_pembayaran_fee_agenState();
}

class _Riwayat_pembayaran_fee_agenState
    extends State<Riwayat_pembayaran_fee_agen> {
  bool loadData = false;
  final config = ConfigApp();

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (!loadData) {
      await Provider.of<Agen_provider>(context, listen: false)
          .getDaftarRiwayatPembayaranFeeAgen();
      loadData = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final list = Provider.of<Agen_provider>(context);
    bool isLoading = list.list_riwayat_pembayaran == null;
    bool isEmpty = !isLoading && list.list_riwayat_pembayaran!.isEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(TablerIcons.arrow_left, color: Colors.white),
        ),
        centerTitle: true,
        title: Text(
          'Riwayat Pembayaran Fee',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: AllBoxLoading())
          : isEmpty
              ? Center(
                  child: NotfoundWidget(
                    config: config,
                    label: 'Pembayaran Fee',
                  ),
                )
              : ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: list.list_riwayat_pembayaran!.length,
                  itemBuilder: (BuildContext context, int index) {
                    final item = list.list_riwayat_pembayaran![index.toString()];
                    if (item == null) return const SizedBox();

                    return BoxListRiwayatPembayaranFeeAgen(
                      kode: item['kode'] ?? '-',
                      total: item['totalPayment'] ?? '0',
                      transaksiPrabayar: item['transaksiPrabayar'] ?? '0',
                      transaksiPascabayar: item['transaksiPascabayar'] ?? '0',
                      datetimes: item['datetimes'] ?? '-',
                    );
                  },
                ),
    );
  }
}

class BoxListRiwayatPembayaranFeeAgen extends StatelessWidget {
  const BoxListRiwayatPembayaranFeeAgen({
    super.key,
    required this.kode,
    required this.total,
    required this.transaksiPrabayar,
    required this.transaksiPascabayar,
    required this.datetimes,
  });

  final String kode;
  final String total;
  final String transaksiPrabayar;
  final String transaksiPascabayar;
  final String datetimes;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withOpacity(0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(
                bottom: BorderSide(color: Colors.grey.shade100),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(TablerIcons.receipt_2, size: 16, color: Color(0xFF2E7D32)),
                    const SizedBox(width: 8),
                    Text(
                      '#$kode',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2E7D32),
                      ),
                    ),
                  ],
                ),
                Text(
                  datetimes,
                  style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
          
          // Body
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2E7D32).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(TablerIcons.coin, color: Color(0xFF2E7D32), size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total Fee Diterima',
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            total,
                            style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF1A1A2E),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F9FA),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildTransactionType(
                          'Prabayar',
                          transaksiPrabayar,
                          TablerIcons.device_mobile,
                        ),
                      ),
                      Container(
                        height: 24,
                        width: 1,
                        color: Colors.grey.shade300,
                      ),
                      Expanded(
                        child: _buildTransactionType(
                          'Pascabayar',
                          transaksiPascabayar,
                          TablerIcons.file_invoice,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionType(String label, String value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 14, color: Colors.grey[600]),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                color: Colors.grey[500],
              ),
            ),
            Text(
              '$value Transaksi',
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1A1A2E),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
