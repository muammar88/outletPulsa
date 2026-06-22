import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'tab/akun.dart';
import 'tab/beranda.dart';
import 'tab/info.dart';
import 'tab/riwayat.dart';

class Home_page extends StatefulWidget {
  const Home_page({super.key});

  @override
  State<Home_page> createState() => _Home_pageState();
}

class _Home_pageState extends State<Home_page> {
  final cnf = ConfigApp();

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  bool loadData = false;
  int _currentIndex = 0;
  final config = ConfigApp();

  @override
  void initState() {
    _currentIndex = 0;
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
    });
  }

  void onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
    // Otomatis refresh data beranda saat tab Beranda diklik
    if (index == 0) {
      Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
    }
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => onTabTapped(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutQuint,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF0F1F6E).withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 24,
              color:
                  isSelected ? const Color(0xFF0F1F6E) : Colors.grey.shade400,
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutQuint,
              child: isSelected
                  ? Padding(
                      padding: const EdgeInsets.only(left: 8.0),
                      child: Text(
                        label,
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0F1F6E),
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).padding.bottom + 8,
          left: 16,
          right: 16,
          top: 8,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildNavItem(0, TablerIcons.home, "Beranda"),
            _buildNavItem(1, TablerIcons.history, "Riwayat"),
            _buildNavItem(2, TablerIcons.bell, "Info"),
            _buildNavItem(3, TablerIcons.user, "Akun"),
          ],
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          Beranda_tab(
              refreshIndicatorKey: _refreshIndicatorKey, config: config),
          Riwayat_tab(),
          Info_tab(),
          Akun_tab(),
        ],
      ),
    );
  }
}

class TitleAppBar extends StatelessWidget {
  TitleAppBar({
    Key? key,
  }) : super(key: key);

  final cnf = ConfigApp();

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 0),
      child: Row(mainAxisAlignment: MainAxisAlignment.start, children: [
        Expanded(
          flex: 3,
          child: Row(
            children: [
              Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Image.asset('assets/img/logo-cycle.png',
                    width: 26, height: 26),
              ),
              Expanded(
                child: Consumer<Beranda_provider>(
                    builder: (context, dataBeranda, child) => Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              dataBeranda.name ?? "User",
                              textAlign: TextAlign.left,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(dataBeranda.nomor_whatsapp ?? "",
                                textAlign: TextAlign.left,
                                style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white.withOpacity(0.8))),
                          ],
                        )),
              ),
              InkWell(
                onTap: () async {
                  loader.isLoad = true;
                  await Provider.of<Beranda_provider>(context, listen: false)
                      .get_data_beranda();
                  loader.isLoad = false;
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    TablerIcons.refresh,
                    size: 20,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ]),
    );
  }
}
