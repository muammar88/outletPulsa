import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/RiwayatTransferProvider.dart';
import '../../../../../widget/NotFound.dart';

class Riwayat_transfer_saldo extends StatefulWidget {
  const Riwayat_transfer_saldo({super.key});

  @override
  State<Riwayat_transfer_saldo> createState() => _Riwayat_transfer_saldoState();
}

class _Riwayat_transfer_saldoState extends State<Riwayat_transfer_saldo> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (!loadData) {
      await Provider.of<Riwayat_transfer_saldo_provider>(context, listen: false)
          .getRiwayatTransferSaldo();
      loadData = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_transfer_saldo_provider>(context);
    bool isEmpty = riwayat.list == null || riwayat.list!.isEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
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
          'Riwayat Transfer Saldo',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: isEmpty
          ? Center(
              child: NotfoundWidget(
                config: config,
                label: "Riwayat Transfer Saldo",
              ),
            )
          : ListView.builder(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              itemCount: riwayat.list!.length,
              itemBuilder: (BuildContext context, int index) {
                return BoxRiwayatTransfer(
                  riwayat: riwayat,
                  index: index,
                );
              },
            ),
    );
  }
}

class BoxRiwayatTransfer extends StatelessWidget {
  const BoxRiwayatTransfer({
    super.key,
    required this.riwayat,
    required this.index,
  });

  final Riwayat_transfer_saldo_provider riwayat;
  final int index;

  @override
  Widget build(BuildContext context) {
    final item = riwayat.list![index.toString()];
    if (item == null) return const SizedBox();

    String tipe = item['tipeTransaksi'] ?? '-';
    String tanggal = item['updatedAt'] ?? '-';
    String nominal = item['biaya'] ?? '-';
    String noHp = item['nowhatsapp'] ?? '-';

    bool isMasuk = tipe.toLowerCase().contains('terima') || tipe.toLowerCase().contains('masuk');
    
    Color iconColor = isMasuk ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F);
    Color iconBgColor = isMasuk ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE);
    IconData iconData = isMasuk ? TablerIcons.arrow_down_left : TablerIcons.arrow_up_right;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
      child: Row(
        children: [
          // Icon Container
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconBgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(iconData, color: iconColor, size: 24),
          ),
          const SizedBox(width: 14),
          
          // Transaction Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tipe,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1A1A2E),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(TablerIcons.device_mobile, size: 14, color: Colors.grey[500]),
                    const SizedBox(width: 4),
                    Text(
                      noHp,
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Amount & Date
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                nominal,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: iconColor, // Use green for income, red for expense
                ),
              ),
              const SizedBox(height: 4),
              Text(
                tanggal,
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: Colors.grey[400],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
