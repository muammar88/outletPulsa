import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/AgenProvider.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/allBoxLoading.dart';

class Daftar_reseller_agen extends StatefulWidget {
  const Daftar_reseller_agen({super.key});

  @override
  State<Daftar_reseller_agen> createState() => _Daftar_reseller_agenState();
}

class _Daftar_reseller_agenState extends State<Daftar_reseller_agen> {
  bool loadData = false;
  final config = ConfigApp();

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (!loadData) {
      await Provider.of<Agen_provider>(context, listen: false).getDaftarAgen();
      loadData = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final list = Provider.of<Agen_provider>(context);
    bool isLoading = list.list_reseller == null;
    bool isEmpty = !isLoading && list.list_reseller!.isEmpty;

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
          'Daftar Reseller Agen',
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
                    label: "Daftar Reseller Agen",
                  ),
                )
              : ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                  itemCount: list.list_reseller!.length,
                  itemBuilder: (BuildContext context, int index) {
                    final item = list.list_reseller![index.toString()];
                    if (item == null) return const SizedBox();

                    return BoxListReseller(
                      kode: item['kode'] ?? '-',
                      name: item['name'] ?? '-',
                      whatsappnumber: item['whatsappnumber'] ?? '-',
                      date: item['date'] ?? '-',
                    );
                  },
                ),
    );
  }
}

class BoxListReseller extends StatelessWidget {
  const BoxListReseller({
    super.key,
    required this.kode,
    required this.name,
    required this.whatsappnumber,
    required this.date,
  });

  final String kode;
  final String name;
  final String whatsappnumber;
  final String date;

  @override
  Widget build(BuildContext context) {
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
          // Icon Box
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF0F1F6E).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              TablerIcons.users,
              color: Color(0xFF0F1F6E),
              size: 24,
            ),
          ),
          const SizedBox(width: 14),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1A1A2E),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F1F6E).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '#$kode',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F1F6E),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(TablerIcons.brand_whatsapp, size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          whatsappnumber,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      date,
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
