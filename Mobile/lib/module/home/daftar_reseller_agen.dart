import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/AgenProvider.dart';
import '../../widget/NotFound.dart';
import '../../widget/allBoxLoading.dart';

class Daftar_reseller_agen extends StatefulWidget {
  const Daftar_reseller_agen({super.key});

  @override
  State<Daftar_reseller_agen> createState() => _Daftar_reseller_agenState();
}

class _Daftar_reseller_agenState extends State<Daftar_reseller_agen> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    // final auth = Provider.of<Transaction_provider>(context);
    if (loadData == false) {
      await Provider.of<Agen_provider>(context).getDaftarAgen();
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
          'Daftar Reseller Agen',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headline4,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: Container(
          // margin: EdgeInsets.only(top: 20),
          padding: EdgeInsets.only(
            left: 30,
            right: 30,
          ),
          child: ListView.builder(
              itemCount: list.list_reseller != null
                  ? list.list_reseller!.length == 0
                      ? 1
                      : list.list_reseller!.length
                  : 1,
              itemBuilder: (BuildContext context, int index) {
                if (list.list_reseller == null) {
                  //return NotfoundProdukWidget(config: config);
                  return AllBoxLoading();
                } else {
                  if (list.list_reseller!.length == 0) {
                    // return NotfoundProdukWidget(config: config);
                    return NotfoundWidget(
                        config: config, label: "Daftar Reseller Agen");
                  } else {
                    if (index == (list.list_reseller!.length - 1) &&
                        index != 0) {
                      return Container(
                          padding: EdgeInsets.only(bottom: 50),
                          child: BoxListReseller(
                            config: config,
                            kode: list.list_reseller![index.toString()]['kode'],
                            name: list.list_reseller![index.toString()]['name'],
                            whatsappnumber:
                                list.list_reseller![index.toString()]
                                    ['whatsappnumber'],
                            date: list.list_reseller![index.toString()]['date'],
                          ));
                    } else if (index == (list.list_reseller!.length - 1) &&
                        index == 0) {
                      return Container(
                          padding: EdgeInsets.only(bottom: 50, top: 20),
                          child: BoxListReseller(
                            config: config,
                            kode: list.list_reseller![index.toString()]['kode'],
                            name: list.list_reseller![index.toString()]['name'],
                            whatsappnumber:
                                list.list_reseller![index.toString()]
                                    ['whatsappnumber'],
                            date: list.list_reseller![index.toString()]['date'],
                          ));
                    } else {
                      if (index == 0) {
                        return Container(
                            padding: EdgeInsets.only(top: 20),
                            child: BoxListReseller(
                              config: config,
                              kode: list.list_reseller![index.toString()]
                                  ['kode'],
                              name: list.list_reseller![index.toString()]
                                  ['name'],
                              whatsappnumber:
                                  list.list_reseller![index.toString()]
                                      ['whatsappnumber'],
                              date: list.list_reseller![index.toString()]
                                  ['date'],
                            ));
                      } else {
                        return BoxListReseller(
                          config: config,
                          kode: list.list_reseller![index.toString()]['kode'],
                          name: list.list_reseller![index.toString()]['name'],
                          whatsappnumber: list.list_reseller![index.toString()]
                              ['whatsappnumber'],
                          date: list.list_reseller![index.toString()]['date'],
                        );
                      }
                    }
                  }
                }
              })),
    );
  }
}

class BoxListReseller extends StatelessWidget {
  const BoxListReseller({
    super.key,
    required this.config,
    required this.kode,
    required this.name,
    required this.whatsappnumber,
    required this.date,
  });

  final ConfigApp config;
  final String kode;
  final String name;
  final String whatsappnumber;
  final String date;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        // if (status == 'active') {
        //   // Navigator.push(
        //   //   context,
        //   //   MaterialPageRoute(
        //   //       builder: (context) => Konfirmasi_pembelian(
        //   //           kode: kode,
        //   //           nominal: nominal,
        //   //           operator: operator,
        //   //           harga: harga,
        //   //           nomor_tujuan: nomor_tujuan)),
        //   // );
        // } else {
        //   ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        //       backgroundColor: const Color.fromARGB(255, 163, 57, 49),
        //       behavior: SnackBarBehavior.floating,
        //       content: Text('Produk tidak aktif tidak dapat dibeli',
        //           style: GoogleFonts.ptSans(
        //               textStyle: Theme.of(context).textTheme.headline4,
        //               fontSize: 12,
        //               color: config.text_light_color))));
        // }
      },
      child: Container(
          height: 60,
          padding: EdgeInsets.only(left: 10, right: 10, top: 5, bottom: 0),
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
                        '#' + kode,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      SizedBox(
                        height: 2,
                      ),
                      Text(name,
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
                        margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text(whatsappnumber,
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
                        margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text(date,
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
