import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/AgenProvider.dart';
import '../../widget/NotFound.dart';
import '../../widget/allBoxLoading.dart';

class Riwayat_pembayaran_fee_agen extends StatefulWidget {
  const Riwayat_pembayaran_fee_agen({super.key});

  @override
  State<Riwayat_pembayaran_fee_agen> createState() =>
      _Riwayat_pembayaran_fee_agenState();
}

class _Riwayat_pembayaran_fee_agenState
    extends State<Riwayat_pembayaran_fee_agen> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    // final auth = Provider.of<Transaction_provider>(context);
    if (loadData == false) {
      await Provider.of<Agen_provider>(context)
          .getDaftarRiwayatPembayaranFeeAgen();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  final config = ConfigApp();
  @override
  Widget build(BuildContext context) {
    final list = Provider.of<Agen_provider>(context);
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
            'Riwayat Pembayaran Fee Agen',
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
                itemCount: list.list_riwayat_pembayaran != null
                    ? list.list_riwayat_pembayaran!.length == 0
                        ? 1
                        : list.list_riwayat_pembayaran!.length
                    : 1,
                itemBuilder: (BuildContext context, int index) {
                  if (list.list_riwayat_pembayaran == null) {
                    //return NotfoundProdukWidget(config: config);
                    return AllBoxLoading();
                  } else {
                    if (list.list_riwayat_pembayaran!.length == 0) {
                      return NotfoundWidget(
                        config: config,
                        label: 'Pembayaran Fee',
                      );
                    } else {
                      if (index == (list.list_riwayat_pembayaran!.length - 1) &&
                          index != 0) {
                        return Container(
                            padding: EdgeInsets.only(bottom: 50),
                            child: BoxListRiwayatPembayaranFeeAgen(
                              config: config,
                              kode: list.list_riwayat_pembayaran![
                                  index.toString()]['kode'],
                              total: list.list_riwayat_pembayaran![
                                  index.toString()]['totalPayment'],
                              transaksiPrabayar: list.list_riwayat_pembayaran![
                                  index.toString()]['transaksiPrabayar'],
                              transaksiPascabayar:
                                  list.list_riwayat_pembayaran![
                                      index.toString()]['transaksiPascabayar'],
                              datetimes: list.list_riwayat_pembayaran![
                                  index.toString()]['datetimes'],
                            ));
                      } else if (index ==
                              (list.list_riwayat_pembayaran!.length - 1) &&
                          index == 0) {
                        return Container(
                            padding: EdgeInsets.only(bottom: 50, top: 20),
                            child: BoxListRiwayatPembayaranFeeAgen(
                              config: config,
                              kode: list.list_riwayat_pembayaran![
                                  index.toString()]['kode'],
                              total: list.list_riwayat_pembayaran![
                                  index.toString()]['totalPayment'],
                              transaksiPrabayar: list.list_riwayat_pembayaran![
                                  index.toString()]['transaksiPrabayar'],
                              transaksiPascabayar:
                                  list.list_riwayat_pembayaran![
                                      index.toString()]['transaksiPascabayar'],
                              datetimes: list.list_riwayat_pembayaran![
                                  index.toString()]['datetimes'],
                            ));
                      } else {
                        if (index == 0) {
                          return Container(
                              padding: EdgeInsets.only(top: 20),
                              child: BoxListRiwayatPembayaranFeeAgen(
                                config: config,
                                kode: list.list_riwayat_pembayaran![
                                    index.toString()]['kode'],
                                total: list.list_riwayat_pembayaran![
                                    index.toString()]['totalPayment'],
                                transaksiPrabayar:
                                    list.list_riwayat_pembayaran![
                                        index.toString()]['transaksiPrabayar'],
                                transaksiPascabayar: list
                                        .list_riwayat_pembayaran![
                                    index.toString()]['transaksiPascabayar'],
                                datetimes: list.list_riwayat_pembayaran![
                                    index.toString()]['datetimes'],
                              ));
                        } else {
                          return BoxListRiwayatPembayaranFeeAgen(
                            config: config,
                            kode:
                                list.list_riwayat_pembayaran![index.toString()]
                                    ['kode'],
                            total:
                                list.list_riwayat_pembayaran![index.toString()]
                                    ['totalPayment'],
                            transaksiPrabayar:
                                list.list_riwayat_pembayaran![index.toString()]
                                    ['transaksiPrabayar'],
                            transaksiPascabayar:
                                list.list_riwayat_pembayaran![index.toString()]
                                    ['transaksiPascabayar'],
                            datetimes:
                                list.list_riwayat_pembayaran![index.toString()]
                                    ['datetimes'],
                          );
                        }
                      }
                    }
                  }
                })));
  }
}

class BoxListRiwayatPembayaranFeeAgen extends StatelessWidget {
  const BoxListRiwayatPembayaranFeeAgen({
    super.key,
    required this.config,
    required this.kode,
    required this.total,
    required this.transaksiPrabayar,
    required this.transaksiPascabayar,
    required this.datetimes,
  });

  final ConfigApp config;
  final String kode;
  final String total;
  final String transaksiPrabayar;
  final String transaksiPascabayar;
  final String datetimes;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      child: Container(
          height: 80,
          padding: EdgeInsets.only(left: 15, right: 15, top: 5, bottom: 0),
          margin: EdgeInsets.only(top: 5, bottom: 5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(5),
            color: Colors.white,
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 8,
                      ),
                      Text(
                        'Kode : #' + kode,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      SizedBox(
                        height: 2,
                      ),
                      Text('Total : ' + total,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                    ],
                  )),
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      SizedBox(
                        height: 8,
                      ),
                      Container(
                        // margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text(datetimes,
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headline4,
                                fontSize: 11,
                                fontWeight: FontWeight.normal,
                                fontStyle: FontStyle.italic,
                                color: config.text_dark_color)),
                      ),
                      SizedBox(
                        height: 2,
                      ),
                      Container(
                        // margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text('Prabayar : ' + transaksiPrabayar,
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headline4,
                                fontSize: 12,
                                fontWeight: FontWeight.normal,
                                color: config.text_dark_color)),
                      ),
                      SizedBox(
                        height: 2,
                      ),
                      Container(
                        // margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text('Pascabayar : ' + transaksiPascabayar,
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headline4,
                                fontSize: 12,
                                fontWeight: FontWeight.normal,
                                color: config.text_dark_color)),
                      ),
                    ],
                  )),
                ],
              ),
            ],
          )),
    );
  }
}
