import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/RiwayatTransferProvider.dart';
import '../../widget/NotFound.dart';

class Riwayat_transfer_saldo extends StatefulWidget {
  const Riwayat_transfer_saldo({super.key});

  @override
  State<Riwayat_transfer_saldo> createState() => _Riwayat_transfer_saldoState();
}

class _Riwayat_transfer_saldoState extends State<Riwayat_transfer_saldo> {
  final config = ConfigApp();

  bool loadData = false;
  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Riwayat_transfer_saldo_provider>(context)
          .getRiwayatTransferSaldo();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_transfer_saldo_provider>(context);
    return Scaffold(
        appBar: AppBar(
          backgroundColor: config.background_smooth_navy,
          elevation: 0,
          centerTitle: true,
          leading: IconButton(
              onPressed: () {
                Navigator.pop(context);
              },
              icon: Icon(
                Icons.arrow_back,
                color: Colors.white,
              )),
          title: Text(
            'Riwayat Transfer Saldo',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: config.text_light_color),
          ),
        ),
        backgroundColor: Colors.grey[200],
        body: Container(
            padding: EdgeInsets.only(
              left: 30,
              right: 30,
            ),
            child: ListView.builder(
                itemCount: riwayat.list != null
                    ? riwayat.list!.length == 0
                        ? 1
                        : riwayat.list!.length
                    : 1,
                itemBuilder: (BuildContext context, int index) {
                  if (riwayat.list == null) {
                    // return NotfoundProdukWidget(config: config);
                    return NotfoundWidget(
                        config: config, label: "Riwayat Transfer Saldo");
                  } else {
                    if (riwayat.list!.length == 0) {
                      return NotfoundWidget(
                          config: config, label: "Riwayat Transfer Saldo");
                    } else {
                      if (index == 0) {
                        return Column(
                          children: [
                            SizedBox(
                              height: 20,
                            ),
                            BoxRiwayatTransfer(
                                config: config, riwayat: riwayat, index: index)
                          ],
                        );
                      } else {
                        return BoxRiwayatTransfer(
                            config: config, riwayat: riwayat, index: index);
                      }
                    }
                  }
                })));
  }
}

class BoxRiwayatTransfer extends StatelessWidget {
  const BoxRiwayatTransfer(
      {super.key,
      required this.config,
      required this.riwayat,
      required this.index});

  final ConfigApp config;
  final Riwayat_transfer_saldo_provider riwayat;
  final index;

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 60,
        padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 0),
        margin: EdgeInsets.only(top: 5, bottom: 5),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Colors.white,
        ),
        child: Row(
          children: [
            Expanded(
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  riwayat.list![index.toString()]['tipeTransaksi'],
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color),
                ),
                Text(
                  riwayat.list![index.toString()]['updatedAt'],
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 12,
                      color: config.text_grey_color),
                ),
              ],
            )),
            Expanded(
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  riwayat.list![index.toString()]['biaya'],
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color),
                ),
                Text(
                  riwayat.list![index.toString()]['nowhatsapp'],
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 12,
                      color: config.text_grey_color),
                ),
              ],
            )),
          ],
        ));
  }
}
