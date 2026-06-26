import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/daftar_reseller_agen.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/info_keagenan.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/AuthenticationProvider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/module/member/widget/akun/saldo/riwayat_transfer_saldo.dart';
import 'package:outletpulsa/module/member/widget/akun/UpdateAkunName.dart';
import 'package:outletpulsa/module/member/widget/akun/saldo/form_transfer_saldo.dart';
import 'package:outletpulsa/module/member/widget/akun/UpdatePassword.dart';
import 'package:outletpulsa/module/member/widget/akun/ketentuan_dan_kebijakan/ketentuan_dan_kebijakan.dart';
import 'package:outletpulsa/module/member/widget/akun/agen/riwayat_pembayaran_fee_agen.dart';
import 'package:outletpulsa/module/public/splash_screen.dart';

class Akun_tab extends StatefulWidget {
  const Akun_tab({super.key});

  @override
  State<Akun_tab> createState() => _Akun_tabState();
}

class _Akun_tabState extends State<Akun_tab> {
  final config = ConfigApp();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        automaticallyImplyLeading: false,
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
        title: Text(
          'Akun Saya',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: Consumer<Beranda_provider>(
        builder: (context, dataBeranda, child) => ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            // ── Profile Header Card ────────────────────────────────
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
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
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(TablerIcons.user_circle,
                        color: Colors.white, size: 32),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          dataBeranda.name ?? '-',
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          dataBeranda.nomor_whatsapp ?? '-',
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            dataBeranda.kode ?? '-',
                            style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── Pengaturan Akun ────────────────────────────────────
            const SizedBox(height: 24),
            _SectionLabel(label: 'Pengaturan Akun'),
            const SizedBox(height: 8),
            _MenuCard(
              children: [
                _MenuItem(
                  icon: TablerIcons.user,
                  iconColor: const Color(0xFF0F1F6E),
                  label: 'Nama Pengguna',
                  value: dataBeranda.name ?? '-',
                  showArrow: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) =>
                            Update_akun_name(name: dataBeranda.name!)),
                  ),
                ),
                _Divider(),
                _MenuItem(
                  icon: TablerIcons.phone,
                  iconColor: const Color(0xFF0097A7),
                  label: 'Nomor Whatsapp',
                  value: dataBeranda.nomor_whatsapp ?? '-',
                  showArrow: false,
                  onTap: null,
                ),
                _Divider(),
                _MenuItem(
                  icon: TablerIcons.lock,
                  iconColor: const Color(0xFF7B1FA2),
                  label: 'Ganti Password',
                  value: '',
                  showArrow: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => Update_password()),
                  ),
                ),
              ],
            ),

            // ── Transfer Saldo ─────────────────────────────────────
            const SizedBox(height: 20),
            _SectionLabel(label: 'Transfer Saldo'),
            const SizedBox(height: 8),
            _MenuCard(
              children: [
                _MenuItem(
                  icon: TablerIcons.transfer,
                  iconColor: const Color(0xFF2E7D32),
                  label: 'Transfer Saldo',
                  value: '',
                  showArrow: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => Form_transfer_saldo()),
                  ),
                ),
                _Divider(),
                _MenuItem(
                  icon: TablerIcons.history,
                  iconColor: const Color(0xFF1565C0),
                  label: 'Riwayat Transfer Saldo',
                  value: '',
                  showArrow: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => Riwayat_transfer_saldo()),
                  ),
                ),
              ],
            ),

            // ── Keagenan ───────────────────────────────────────────
            if (dataBeranda.isAgen) ...[
              const SizedBox(height: 20),
              _SectionLabel(label: 'Keagenan'),
              const SizedBox(height: 8),
              _MenuCard(
                children: [
                  _MenuItem(
                    icon: TablerIcons.info_circle,
                    iconColor: const Color(0xFF1976D2),
                    label: 'Info Keagenan',
                    value: '',
                    showArrow: true,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => Info_keagenan()),
                    ),
                  ),
                  _Divider(),
                  _MenuItem(
                    icon: TablerIcons.users,
                    iconColor: const Color(0xFFF57F17),
                    label: 'Daftar Reseller Agen',
                    value: '',
                    showArrow: true,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => Daftar_reseller_agen()),
                    ),
                  ),
                  _Divider(),
                  _MenuItem(
                    icon: TablerIcons.receipt,
                    iconColor: const Color(0xFF00796B),
                    label: 'Riwayat Pembayaran Fee Agen',
                    value: '',
                    showArrow: true,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => Riwayat_pembayaran_fee_agen()),
                    ),
                  ),
                ],
              ),
            ],

            // ── Ketentuan Dan Kebijakan ────────────────────────────
            const SizedBox(height: 20),
            _SectionLabel(label: 'Ketentuan Dan Kebijakan'),
            const SizedBox(height: 8),
            _MenuCard(
              children: [
                _MenuItem(
                  icon: TablerIcons.file_description,
                  iconColor: const Color(0xFF5D4037),
                  label: 'Ketentuan dan Kebijakan',
                  value: '',
                  showArrow: true,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => Ketentuan_dan_kebijakan()),
                  ),
                ),
              ],
            ),

            // ── Logout ─────────────────────────────────────────────
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () async {
                await Provider.of<Authentication_provider>(context, listen: false)
                    .logOut();
                if (!context.mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const SplashScreen()),
                    (route) => false);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFEBEE),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: const Color(0xFFD32F2F).withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(TablerIcons.logout,
                        size: 18, color: Color(0xFFD32F2F)),
                    const SizedBox(width: 10),
                    Text(
                      'Keluar',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFFD32F2F),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

// ─── Helper Widgets ───────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: GoogleFonts.poppins(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: Colors.grey[500],
        letterSpacing: 0.5,
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  final List<Widget> children;
  const _MenuCard({required this.children});

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
      child: Column(children: children),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      color: Colors.grey.shade100,
      indent: 56,
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final bool showArrow;
  final VoidCallback? onTap;

  const _MenuItem({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.showArrow,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF1A1A2E),
                ),
              ),
            ),
            if (value.isNotEmpty)
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  color: Colors.grey[500],
                ),
              ),
            if (showArrow) ...[
              const SizedBox(width: 6),
              Icon(TablerIcons.chevron_right,
                  size: 16, color: Colors.grey.shade400),
            ],
          ],
        ),
      ),
    );
  }
}

// Legacy widgets kept for backward compatibility
class BoxOneRowWidget extends StatelessWidget {
  const BoxOneRowWidget({
    super.key,
    required this.config,
    required this.label,
    required this.id,
    required this.arrowStatus,
  });

  final ConfigApp config;
  final String label;
  final String id;
  final bool arrowStatus;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 30,
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                  fontSize: 13, color: config.text_dark_color),
            ),
          ),
          if (arrowStatus)
            Icon(TablerIcons.chevron_right,
                color: config.text_grey_color, size: 15),
        ],
      ),
    );
  }
}

class BoxAkunWidget extends StatelessWidget {
  const BoxAkunWidget({
    super.key,
    required this.config,
    required this.label,
    required this.value,
    required this.arrowStatus,
  });

  final ConfigApp config;
  final String label;
  final String value;
  final bool arrowStatus;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 30,
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: config.text_dark_color)),
          ),
          Expanded(
            child: Text(value,
                textAlign: TextAlign.right,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: config.text_dark_color)),
          ),
          if (arrowStatus)
            Container(
              margin: const EdgeInsets.only(left: 15),
              child: Icon(TablerIcons.chevron_right,
                  color: config.text_grey_color, size: 15),
            )
          else
            const SizedBox(width: 10),
        ],
      ),
    );
  }
}
