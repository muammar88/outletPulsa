import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
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
    return Column(
      children: [
        Container(
            margin: EdgeInsets.only(top: 100),
            // padding: EdgeInsets.symmetric(vertical: 20),
            child: Image.asset('assets/img/no-results.png',
                width: 100, fit: BoxFit.fill)),
        SizedBox(
          height: 10,
        ),
        Text(label,
            textAlign: TextAlign.center,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.black)),
        SizedBox(
          height: 2,
        ),
        Text('Tidak Ditemukan',
            textAlign: TextAlign.center,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.black)),
        SizedBox(
          height: 10,
        ),
        ElevatedButton(
            onPressed: () async {
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: Container(
              width: 80,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    FontAwesomeIcons.backward,
                    size: 15,
                    color: Colors.black,
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  Text('Back',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.black))
                ],
              ),
            ),
            style: ButtonStyle(
              side: MaterialStateProperty.all(BorderSide(
                  color: Colors.black, width: 2.5, style: BorderStyle.solid)),
              shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                  RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(5.0),
              )),
              backgroundColor: MaterialStateProperty.all(
                  const Color.fromARGB(255, 245, 193, 71)),
              padding: MaterialStateProperty.all(
                  EdgeInsets.only(top: 10, bottom: 10, left: 10, right: 10)),
            ))
      ],
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
//                     FontAwesomeIcons.houseChimneyWindow,
//                     size: 15,
//                   ),
//                   SizedBox(
//                     width: 10,
//                   ),
//                   Text('Kembali ke Beranda',
//                       textAlign: TextAlign.center,
//                       style: GoogleFonts.ptSans(
//                           textStyle: Theme.of(context).textTheme.headline4,
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
//                     FontAwesomeIcons.houseChimneyWindow,
//                     size: 15,
//                   ),
//                   SizedBox(
//                     width: 10,
//                   ),
//                   Text('Kembali ke Beranda',
//                       textAlign: TextAlign.center,
//                       style: GoogleFonts.ptSans(
//                           textStyle: Theme.of(context).textTheme.headline4,
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
//         //             FontAwesomeIcons.houseChimneyWindow,
//         //             size: 15,
//         //           ),
//         //           SizedBox(
//         //             width: 10,
//         //           ),
//         //           Text('Kembali ke Beranda',
//         //               textAlign: TextAlign.center,
//         //               style: GoogleFonts.ptSans(
//         //                   textStyle: Theme.of(context).textTheme.headline4,
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
