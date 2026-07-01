import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/pengumuman_provider.dart';
import 'package:outletpulsa/shared/widgets/allBoxLoading.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'dart:convert';
import 'package:outletpulsa/module/member/widget/pengumuman/Detail_pengumuman.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_transaksi.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_transaksi_pascabayar.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_deposit.dart';
class Pengumuman_tab extends StatefulWidget {
  const Pengumuman_tab({super.key});

  @override
  State<Pengumuman_tab> createState() => _Pengumuman_tabState();
}

class _Pengumuman_tabState extends State<Pengumuman_tab> {
  final config = ConfigApp();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PengumumanProvider>(context, listen: false).fetchMobileHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
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
            'Pusat Info',
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
                indicator: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelColor: const Color(0xFF0F1F6E),
                unselectedLabelColor: Colors.white.withOpacity(0.85),
                labelStyle: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                ),
                tabs: const [
                  Tab(text: "Belum Dibaca"),
                  Tab(text: "Sudah Dibaca"),
                ],
              ),
            ),
          ),
        ),
        body: Consumer<PengumumanProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const AllBoxLoading();
            }

            final unreadList = provider.listPengumuman.where((item) => item['status'] == 'Delivered').toList();
            final readList = provider.listPengumuman.where((item) => item['status'] == 'Read').toList();

            return TabBarView(
              children: [
                _buildPengumumanList(provider, unreadList, 'Tidak ada Info baru'),
                _buildPengumumanList(provider, readList, 'Belum ada Info yang dibaca'),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildPengumumanList(PengumumanProvider provider, List<dynamic> list, String emptyLabel) {
    Widget content;
    if (list.isEmpty) {
      content = NotfoundWidget(config: config, label: emptyLabel);
    } else {
      content = ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        padding: const EdgeInsets.all(16),
        itemCount: list.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = list[index];
          final pengumumanData = item['pengumuman'];
          final isRead = item['status'] == 'Read';

          // Safe check if pengumumanData is null
          if (pengumumanData == null) return const SizedBox();

          return InkWell(
            onTap: () {
              if (!isRead) {
                provider.markAsRead(item['id']);
              }
              
              String type = (pengumumanData['pengumuman_type'] ?? 'announcement').toString().toLowerCase();
              String referenceId = '';
              
              if (pengumumanData['payload'] != null && pengumumanData['payload'].toString().isNotEmpty) {
                 try {
                    final payloadJson = jsonDecode(pengumumanData['payload']);
                    referenceId = payloadJson['reference_id']?.toString() ?? '';
                 } catch(e) {}
              }
              
              Widget destination;
              switch (type) {
                case 'prabayar':
                  destination = Detail_transaksi(kodeTrans: referenceId);
                  break;
                case 'pascabayar':
                  destination = Detail_transaksi_pascabayar(kodeTrans: referenceId);
                  break;
                case 'deposit':
                  destination = Detail_deposit(status: '', id: referenceId);
                  break;
                default:
                  destination = Detail_pengumuman(
                    id: item['id'].toString(),
                    title: pengumumanData['title'] ?? 'No Title',
                    desc: pengumumanData['body'] ?? 'No Content',
                  );
              }

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => destination
                ),
              );
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isRead ? Colors.white : const Color(0xFFE8EAF6),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isRead ? Colors.grey.shade200 : const Color(0xFF1A3DB5).withOpacity(0.3),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isRead ? Colors.grey.shade100 : const Color(0xFF1A3DB5).withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      pengumumanData['pengumuman_type'] == 'Transaction' ? TablerIcons.receipt :
                      pengumumanData['pengumuman_type'] == 'Promo' ? TablerIcons.discount : TablerIcons.bell,
                      color: isRead ? Colors.grey.shade500 : const Color(0xFF1A3DB5),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pengumumanData['title'] ?? '',
                          style: GoogleFonts.poppins(
                            fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                            fontSize: 14,
                            color: isRead ? Colors.black87 : Colors.black,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          pengumumanData['body'] ?? '',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!isRead)
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(top: 6),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A3DB5),
                        shape: BoxShape.circle,
                      ),
                    )
                ],
              ),
            ),
          );
        },
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await provider.fetchMobileHistory();
      },
      child: content,
    );
  }
}


