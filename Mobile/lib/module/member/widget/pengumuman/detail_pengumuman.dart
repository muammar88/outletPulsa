import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/pengumuman_provider.dart';

class Detail_pengumuman extends StatefulWidget {
  const Detail_pengumuman({
    super.key,
    required this.id,
    required this.title,
    required this.desc,
  });

  final String id;
  final String title;
  final String desc;

  @override
  State<Detail_pengumuman> createState() => _Detail_pengumumanState();
}

class _Detail_pengumumanState extends State<Detail_pengumuman> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() {
    if (!loadData) {
      loadData = true;

      // id here might be Pengumuman_id from FCM push or recipient_id from Info tab.
      // If it's opened from Info tab, we don't necessarily need to mark as read here 
      // because Info tab already marks it as read when clicked.
      // If opened from Push Pengumuman, it's PengumumanId, which we match and mark.
      int parsedId = int.tryParse(widget.id) ?? 0;
      if (parsedId != 0) {
         WidgetsBinding.instance.addPostFrameCallback((_) {
             final provider = Provider.of<PengumumanProvider>(context, listen: false);
             provider.fetchMobileHistory().then((_) {
                 try {
                   final item = provider.listPengumuman.firstWhere(
                       (el) => (el['pengumuman'] != null && el['pengumuman']['id'] == parsedId) || el['id'] == parsedId);
                   if (item != null && item['status'] != 'Read') {
                       provider.markAsRead(item['id']);
                   }
                 } catch (e) {
                   debugPrint('Pengumuman not found in history yet');
                 }
             });
         });
      }
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1F6E),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
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
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(TablerIcons.arrow_left, color: Colors.white),
        ),
        title: Text(
          'Informasi',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Header Section
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            padding: const EdgeInsets.only(left: 24, right: 24, bottom: 40, top: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    TablerIcons.news,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  widget.title,
                  style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(TablerIcons.broadcast,
                        color: Colors.white.withOpacity(0.7), size: 16),
                    const SizedBox(width: 6),
                    Text(
                      'Pengumuman Resmi',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Content Section
          Expanded(
            child: Transform.translate(
              offset: const Offset(0, -20),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          margin: const EdgeInsets.only(bottom: 24),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      Text(
                        'Detail Pesan',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A2E),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        widget.desc,
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          color: Colors.grey.shade700,
                          height: 1.7,
                        ),
                      ),
                      const SizedBox(height: 40),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(TablerIcons.check,
                                  color: Colors.green, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'Pesan telah dibaca',
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

