import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/config.dart';

class NotfoundWidget extends StatelessWidget {
  const NotfoundWidget({
    super.key,
    required this.config,
    required this.label,
  });

  final String label;
  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 80),
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Icon container
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF1F2AAA).withOpacity(0.08),
                  const Color(0xFF3A47C5).withOpacity(0.15),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                TablerIcons.file_search,
                size: 48,
                color: const Color(0xFF1F2AAA).withOpacity(0.5),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Title
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
          // Subtitle
          Text(
            'Data tidak ditemukan.\nCoba refresh atau kembali ke beranda.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 12,
              color: Colors.grey[500],
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          // Back button
          GestureDetector(
            onTap: () {
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF1F2AAA),
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1F2AAA).withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(TablerIcons.arrow_left, size: 16, color: Colors.white),
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
      ),
    );
  }
}

// class NotfoundRiwayatTransaksiWidget extends StatelessWidget {
//   const NotfoundRiwayatTransaksiWidget({
//     super.key,
//     required this.config,
//   });

//   final ConfigApp config;

//   @override
//   Widget build(BuildContext context) {
//     return Column(
//       children: [
//         Container(
//             margin: EdgeInsets.only(top: 100),
//             // padding: EdgeInsets.symmetric(vertical: 20),
//             child: Image.asset('assets/img/notfound_riwayat_transaksi.png',
//                 width: 100, fit: BoxFit.fill)),
//         SizedBox(
//           height: 20,
//         ),
//         ElevatedButton(
//             onPressed: () async {
//               Navigator.of(context).popUntil((route) => route.isFirst);
//             },
//             child: Container(
//               width: 180,
//               child: Row(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   Icon(
//                     TablerIcons.home,
//                     size: 15,
//                   ),
//                   SizedBox(
//                     width: 10,
//                   ),
//                   Text('Kembali ke Beranda',
//                       textAlign: TextAlign.center,
//                       style: GoogleFonts.poppins(
//                           textStyle: Theme.of(context).textTheme.headlineMedium,
//                           fontSize: 15,
//                           fontWeight: FontWeight.bold,
//                           color: config.text_light_color))
//                 ],
//               ),
//             ),
//             style: ButtonStyle(
//               shape: MaterialStateProperty.all<RoundedRectangleBorder>(
//                   RoundedRectangleBorder(
//                 borderRadius: BorderRadius.circular(5.0),
//               )),
//               backgroundColor:
//                   MaterialStateProperty.all(config.btn_primary_color),
//               padding: MaterialStateProperty.all(
//                   EdgeInsets.only(top: 10, bottom: 10, left: 10, right: 10)),
//             ))
//       ],
//     );
//   }
// }

// class NotfoundRiwayatDepositWidget extends StatelessWidget {
//   const NotfoundRiwayatDepositWidget({
//     super.key,
//     required this.config,
//   });

//   final ConfigApp config;

//   @override
//   Widget build(BuildContext context) {
//     return Column(
//       children: [
//         Container(
//             margin: EdgeInsets.only(top: 100),
//             // padding: EdgeInsets.symmetric(vertical: 20),
//             child: Image.asset('assets/img/notfound_riwayat_deposit.png',
//                 width: 100, fit: BoxFit.fill)),
//         SizedBox(
//           height: 20,
//         ),
//         ElevatedButton(
//             onPressed: () async {
//               Navigator.of(context).popUntil((route) => route.isFirst);
//             },
//             child: Container(
//               width: 180,
//               child: Row(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   Icon(
//                     TablerIcons.home,
//                     size: 15,
//                   ),
//                   SizedBox(
//                     width: 10,
//                   ),
//                   Text('Kembali ke Beranda',
//                       textAlign: TextAlign.center,
//                       style: GoogleFonts.poppins(
//                           textStyle: Theme.of(context).textTheme.headlineMedium,
//                           fontSize: 15,
//                           fontWeight: FontWeight.bold,
//                           color: config.text_light_color))
//                 ],
//               ),
//             ),
//             style: ButtonStyle(
//               shape: MaterialStateProperty.all<RoundedRectangleBorder>(
//                   RoundedRectangleBorder(
//                 borderRadius: BorderRadius.circular(5.0),
//               )),
//               backgroundColor:
//                   MaterialStateProperty.all(config.btn_primary_color),
//               padding: MaterialStateProperty.all(
//                   EdgeInsets.only(top: 10, bottom: 10, left: 10, right: 10)),
//             ))
//       ],
//     );
//   }
// }

// class NotfoundInfoWidget extends StatelessWidget {
//   const NotfoundInfoWidget({
//     super.key,
//     required this.config,
//   });

//   final ConfigApp config;

//   @override
//   Widget build(BuildContext context) {
//     return Column(
//       children: [
//         Container(
//             margin: EdgeInsets.only(top: 100),
//             // padding: EdgeInsets.symmetric(vertical: 20),
//             child: Image.asset('assets/img/notfound_info.png',
//                 width: 100, fit: BoxFit.fill)),
//         // SizedBox(
//         //   height: 50,
//         // ),
//         // ElevatedButton(
//         //     onPressed: () async {
//         //       Navigator.of(context).popUntil((route) => route.isFirst);
//         //     },
//         //     child: Container(
//         //       width: 180,
//         //       child: Row(
//         //         mainAxisAlignment: MainAxisAlignment.center,
//         //         children: [
//         //           Icon(
//         //             TablerIcons.home,
//         //             size: 15,
//         //           ),
//         //           SizedBox(
//         //             width: 10,
//         //           ),
//         //           Text('Kembali ke Beranda',
//         //               textAlign: TextAlign.center,
//         //               style: GoogleFonts.poppins(
//         //                   textStyle: Theme.of(context).textTheme.headlineMedium,
//         //                   fontSize: 15,
//         //                   fontWeight: FontWeight.bold,
//         //                   color: config.text_light_color))
//         //         ],
//         //       ),
//         //     ),
//         //     style: ButtonStyle(
//         //       shape: MaterialStateProperty.all<RoundedRectangleBorder>(
//         //           RoundedRectangleBorder(
//         //         borderRadius: BorderRadius.circular(5.0),
//         //       )),
//         //       backgroundColor:
//         //           MaterialStateProperty.all(config.btn_primary_color),
//         //       padding: MaterialStateProperty.all(
//         //           EdgeInsets.only(top: 10, bottom: 10, left: 10, right: 10)),
//         //     ))
//       ],
//     );
//   }
// }

