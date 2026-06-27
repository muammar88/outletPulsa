import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/InfoBelumBacaProvider.dart';
import 'package:outletpulsa/shared/providers/InfoSudahBacaProvider.dart';
import 'package:outletpulsa/shared/widgets/allBoxLoading.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/module/member/widget/info/detail_info.dart';

class Info_tab extends StatefulWidget {
  const Info_tab({super.key});

  @override
  State<Info_tab> createState() => _Info_tabState();
}

class _Info_tabState extends State<Info_tab>
    with SingleTickerProviderStateMixin {
  final config = ConfigApp();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

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
          'Informasi',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(46),
          child: Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: const Color(0xFF0F1F6E),
              unselectedLabelColor: Colors.white.withOpacity(0.85),
              labelStyle: GoogleFonts.poppins(
                  fontSize: 12, fontWeight: FontWeight.w600),
              unselectedLabelStyle: GoogleFonts.poppins(
                  fontSize: 12, fontWeight: FontWeight.w400),
              tabs: const [
                Tab(text: 'Belum Dibaca'),
                Tab(text: 'Sudah Dibaca'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          Sub_tab_belum_baca(),
          Sub_tab_sudah_baca(),
        ],
      ),
    );
  }
}

// ─── Sub Tab Sudah Baca ───────────────────────────────────────────────────────

class Sub_tab_sudah_baca extends StatefulWidget {
  Sub_tab_sudah_baca({super.key});

  @override
  State<Sub_tab_sudah_baca> createState() => _Sub_tab_sudah_bacaState();
}

class _Sub_tab_sudah_bacaState extends State<Sub_tab_sudah_baca> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      loadData = true;

      await Provider.of<Info_sudah_baca_provider>(context).getInfoSudahBaca();
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final info = Provider.of<Info_sudah_baca_provider>(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: info.list != null
            ? info.list!.length == 0
                ? 1
                : info.list!.length
            : 1,
        itemBuilder: (BuildContext context, int index) {
          if (info.list == null) return AllBoxLoading();
          if (info.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Daftar Info');
          }
          final item = info.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxInfo(
                    config: config,
                    id: item['id'].toString(),
                    title: item['title'].toString(),
                    desc: item['desc'].toString(),
                    isRead: true,
                  ),
                ])
              : BoxInfo(
                  config: config,
                  id: item['id'].toString(),
                  title: item['title'].toString(),
                  desc: item['desc'].toString(),
                  isRead: true,
                );
        },
      ),
    );
  }
}

// ─── Sub Tab Belum Baca ───────────────────────────────────────────────────────

class Sub_tab_belum_baca extends StatefulWidget {
  Sub_tab_belum_baca({super.key});

  @override
  State<Sub_tab_belum_baca> createState() => _Sub_tab_belum_bacaState();
}

class _Sub_tab_belum_bacaState extends State<Sub_tab_belum_baca> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      loadData = true;

      await Provider.of<Info_belum_baca_provider>(context).getInfoBelumBaca();
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final info = Provider.of<Info_belum_baca_provider>(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: info.list != null
            ? info.list!.length == 0
                ? 1
                : info.list!.length
            : 1,
        itemBuilder: (BuildContext context, int index) {
          if (info.list == null) return AllBoxLoading();
          if (info.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Daftar Info');
          }
          final item = info.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxInfo(
                    config: config,
                    id: item['id'].toString(),
                    title: item['title'].toString(),
                    desc: item['desc'].toString(),
                    isRead: false,
                  ),
                ])
              : BoxInfo(
                  config: config,
                  id: item['id'].toString(),
                  title: item['title'].toString(),
                  desc: item['desc'].toString(),
                  isRead: false,
                );
        },
      ),
    );
  }
}

// ─── BoxInfo Card ─────────────────────────────────────────────────────────────

class BoxInfo extends StatelessWidget {
  const BoxInfo({
    super.key,
    required this.config,
    required this.id,
    required this.title,
    required this.desc,
    this.isRead = false,
  });

  final ConfigApp config;
  final String id;
  final String title;
  final String desc;
  final bool isRead;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) =>
                  Detail_info(id: id, title: title, desc: desc)),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isRead
                ? Colors.grey.shade200
                : const Color(0xFF0F1F6E).withOpacity(0.1),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F1F6E).withOpacity(0.04),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isRead
                    ? Colors.grey.shade50
                    : const Color(0xFF0F1F6E).withOpacity(0.05),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(
                  bottom: BorderSide(color: Colors.grey.shade100),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          TablerIcons.info_circle,
                          size: 16,
                          color: isRead ? Colors.grey.shade500 : const Color(0xFF0F1F6E),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Informasi #$id',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isRead ? Colors.grey.shade600 : const Color(0xFF0F1F6E),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!isRead)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      ),
                      child: Text(
                        'Baru',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.redAccent,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Body
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon Container
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isRead
                          ? Colors.grey.shade50
                          : const Color(0xFF0F1F6E).withOpacity(0.06),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      isRead ? TablerIcons.mail_opened : TablerIcons.bell,
                      color: isRead ? Colors.grey.shade400 : const Color(0xFF0F1F6E),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Text Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: isRead
                                ? Colors.grey.shade600
                                : const Color(0xFF1A1A2E),
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          desc,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Text(
                              'Baca Selengkapnya',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: isRead
                                    ? Colors.grey.shade400
                                    : const Color(0xFF0F1F6E),
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              TablerIcons.arrow_right,
                              size: 16,
                              color: isRead
                                  ? Colors.grey.shade400
                                  : const Color(0xFF0F1F6E),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
