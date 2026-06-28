import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:outletpulsa/core/constants/config.dart';

/// Widget empty state yang seragam untuk seluruh fitur.
///
/// Parameter:
/// - [label]    : Judul utama (wajib), contoh: "Daftar Produk Kosong"
/// - [subtitle] : Keterangan tambahan (opsional), default: pesan umum
/// - [icon]     : Ikon (opsional), default: TablerIcons.file_search
/// - [config]   : ConfigApp (opsional, untuk konsistensi tema)
/// - [showBackButton] : Tampilkan tombol kembali (default: true)
class NotfoundWidget extends StatelessWidget {
  const NotfoundWidget({
    super.key,
    required this.label,
    this.subtitle,
    this.icon,
    this.config,
    this.showBackButton = true,
  });

  final String label;
  final String? subtitle;
  final IconData? icon;
  final ConfigApp? config;
  final bool showBackButton;

  static const Color _defaultPrimary = Color(0xFF0F1F6E);

  @override
  Widget build(BuildContext context) {
    final Color primaryColor = _defaultPrimary;
    final IconData displayIcon = icon ?? TablerIcons.file_search;
    final String displaySubtitle =
        subtitle ?? 'Data tidak ditemukan.\nCoba refresh atau kembali ke beranda.';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Ikon container
          Container(
            width: 104,
            height: 104,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  primaryColor.withOpacity(0.08),
                  primaryColor.withOpacity(0.15),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                displayIcon,
                size: 48,
                color: primaryColor.withOpacity(0.5),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Judul
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 6),

          // Subjudul
          Text(
            displaySubtitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.grey[500],
              height: 1.5,
            ),
          ),

          // Tombol kembali (opsional)
          if (showBackButton) ...[
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(TablerIcons.arrow_left,
                        size: 16, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(
                      'Kembali',
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
