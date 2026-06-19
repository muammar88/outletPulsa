import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../../config/config.dart';

class Ketentuan_dan_kebijakan extends StatefulWidget {
  const Ketentuan_dan_kebijakan({super.key});

  @override
  State<Ketentuan_dan_kebijakan> createState() =>
      _Ketentuan_dan_kebijakanState();
}

class _Ketentuan_dan_kebijakanState extends State<Ketentuan_dan_kebijakan> {
  final config = ConfigApp();

  @override
  Widget build(BuildContext context) {
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
          'Ketentuan & Kebijakan',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: ListView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          // Header banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F1F6E).withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(
                    TablerIcons.file_description,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Fitur Keagenan',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Baca seluruh ketentuan sebelum menggunakan fitur ini.',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.white.withOpacity(0.8),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Content sections
          _SectionCard(
            index: 1,
            title: 'Apa itu Fitur Keagenan?',
            icon: TablerIcons.info_circle,
            child: RichText(
              textAlign: TextAlign.justify,
              text: TextSpan(
                style: GoogleFonts.poppins(
                    fontSize: 13, height: 1.7, color: const Color(0xFF444444)),
                children: [
                  const TextSpan(
                    text:
                        'Fitur Keagenan adalah salah satu fitur yang tersedia dalam aplikasi ',
                  ),
                  TextSpan(
                    text: 'OutletPulsa ',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontStyle: FontStyle.italic,
                        color: const Color(0xFF0F1F6E)),
                  ),
                  const TextSpan(
                    text: 'untuk Member ',
                  ),
                  TextSpan(
                    text: 'OutletPulsa ',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontStyle: FontStyle.italic,
                        color: const Color(0xFF0F1F6E)),
                  ),
                  const TextSpan(
                    text:
                        'yang ingin memiliki reseller produk yang tersedia di platform ini. Fitur ini akan memberikan komisi kepada Agen sebesar ',
                  ),
                  TextSpan(
                    text: 'Rp 20,-',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF2E7D32)),
                  ),
                  const TextSpan(
                    text:
                        ' dari setiap transaksi yang dilakukan oleh reseller. Komisi tersebut akan secara otomatis didistribusikan ke saldo member sekali dalam sehari.',
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 12),

          _SectionCard(
            index: 2,
            title: 'Penggunaan Saldo',
            icon: TablerIcons.wallet,
            child: RichText(
              textAlign: TextAlign.justify,
              text: TextSpan(
                style: GoogleFonts.poppins(
                    fontSize: 13, height: 1.7, color: const Color(0xFF444444)),
                children: [
                  const TextSpan(
                    text:
                        'Saldo yang didapatkan, dapat digunakan kembali untuk membeli produk di ',
                  ),
                  TextSpan(
                    text: 'OutletPulsa ',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontStyle: FontStyle.italic,
                        color: const Color(0xFF0F1F6E)),
                  ),
                  const TextSpan(
                    text:
                        'atau untuk mentransfer ke anggota lainnya di platform ini. Selain itu, anggota ',
                  ),
                  TextSpan(
                    text: 'OutletPulsa ',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        fontStyle: FontStyle.italic,
                        color: const Color(0xFF0F1F6E)),
                  ),
                  const TextSpan(
                    text:
                        'juga bisa mentransfer saldo pulsa mereka kepada reseller di bawah mereka. Namun, saldo dari setiap anggota ',
                  ),
                  TextSpan(
                    text: 'tidak dapat ditarik (withdraw).',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFFD32F2F)),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 12),

          _SectionCard(
            index: 3,
            title: 'Cara Menambah Reseller',
            icon: TablerIcons.user_plus,
            child: Text(
              'Untuk menambahkan reseller baru, agen cukup memasukkan kode member saat mendaftarkan member baru. Setelah itu member baru tersebut akan otomatis menjadi reseller dari agen tersebut.',
              textAlign: TextAlign.justify,
              style: GoogleFonts.poppins(
                  fontSize: 13, height: 1.7, color: const Color(0xFF444444)),
            ),
          ),

          const SizedBox(height: 12),

          _SectionCard(
            index: 4,
            title: 'Riwayat & Perubahan Kebijakan',
            icon: TablerIcons.clock,
            child: RichText(
              textAlign: TextAlign.justify,
              text: TextSpan(
                style: GoogleFonts.poppins(
                    fontSize: 13, height: 1.7, color: const Color(0xFF444444)),
                children: [
                  const TextSpan(
                    text:
                        'Setiap member dapat melihat riwayat pencairan Fee keagenan masing-masing di menu ',
                  ),
                  TextSpan(
                    text: 'Riwayat Pembayaran Fee Agen',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F1F6E)),
                  ),
                  const TextSpan(
                    text:
                        '. Ketentuan dan kebijakan dari fitur keagenan dapat berubah sewaktu waktu tanpa pemberitahuan sebelumnya.',
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // OK button
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 15),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F1F6E).withOpacity(0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(TablerIcons.check, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'Saya Mengerti',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }
}

// ─── Section Card ─────────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final int index;
  final String title;
  final IconData icon;
  final Widget child;

  const _SectionCard({
    required this.index,
    required this.title,
    required this.icon,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Section header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F1F6E).withOpacity(0.05),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: const Color(0xFF0F1F6E), size: 18),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    title,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF0F1F6E),
                    ),
                  ),
                ),
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '$index',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F1F6E),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Section body
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: child,
          ),
        ],
      ),
    );
  }
}
