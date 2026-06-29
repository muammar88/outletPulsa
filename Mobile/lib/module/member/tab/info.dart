import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/notification_provider.dart';
import 'package:outletpulsa/shared/widgets/allBoxLoading.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';

class Info_tab extends StatefulWidget {
  const Info_tab({super.key});

  @override
  State<Info_tab> createState() => _Info_tabState();
}

class _Info_tabState extends State<Info_tab> {
  final config = ConfigApp();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationProvider>(context, listen: false).fetchMobileHistory();
    });
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
          'Pusat Notifikasi',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const AllBoxLoading();
          }

          if (provider.listNotification.isEmpty) {
            return NotfoundWidget(config: config, label: 'Daftar Notifikasi');
          }

          return RefreshIndicator(
            onRefresh: () async {
              await provider.fetchMobileHistory();
            },
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              padding: const EdgeInsets.all(16),
              itemCount: provider.listNotification.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = provider.listNotification[index];
                final notification = item['notification'];
                final isRead = item['status'] == 'Read';

                return InkWell(
                  onTap: () {
                    if (!isRead) {
                      provider.markAsRead(item['id']);
                    }
                    // Tampilkan dialog detail
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: Text(notification['title'], style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                        content: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (notification['image_url'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(notification['image_url']),
                                  ),
                                ),
                              Text(notification['body'], style: GoogleFonts.poppins()),
                            ],
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Tutup'),
                          )
                        ],
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
                            notification['notification_type'] == 'Transaction' ? TablerIcons.receipt :
                            notification['notification_type'] == 'Promo' ? TablerIcons.discount : TablerIcons.bell,
                            color: isRead ? Colors.grey.shade500 : const Color(0xFF1A3DB5),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notification['title'],
                                style: GoogleFonts.poppins(
                                  fontWeight: isRead ? FontWeight.w600 : FontWeight.bold,
                                  fontSize: 14,
                                  color: isRead ? Colors.black87 : Colors.black,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                notification['body'],
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
            ),
          );
        },
      ),
    );
  }
}
