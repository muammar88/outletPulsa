import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/InfoBelumBacaProvider.dart';
import '../../provider/InfoSudahBacaProvider.dart';
import '../../widget/allBoxLoading.dart';
import '../../widget/NotFound.dart';
import '../transaksi/detail_info.dart';

class Info_tab extends StatefulWidget {
  const Info_tab({super.key});

  @override
  State<Info_tab> createState() => _Info_tabState();
}

class _Info_tabState extends State<Info_tab> {
  final config = ConfigApp();
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: config.background_smooth_navy,
            elevation: 0,
            centerTitle: false,
            bottom: PreferredSize(
              preferredSize: new Size(0.0, 0.0),
              child: Container(
                child: TabBar(
                  labelStyle: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: config.text_grey_color),
                  unselectedLabelColor: config.text_light_color,
                  tabs: [
                    Tab(text: "Belum Dibaca"),
                    Tab(text: "Sudah Dibaca"),
                  ],
                ),
              ),
            ),

            // title: TitleAppBar(),
          ),
          backgroundColor: Colors.grey[200],
          body: TabBarView(
            children: [
              Sub_tab_belum_baca(),
              Sub_tab_sudah_baca(),
              // Sub_riwayat_prabayar(),
              // Sub_riwayat_pascabayar(),
              // Sub_riwayat_deposit(),
            ],
          )),
    );
  }
}

class Sub_tab_sudah_baca extends StatefulWidget {
  Sub_tab_sudah_baca({
    super.key,
  });

  @override
  State<Sub_tab_sudah_baca> createState() => _Sub_tab_sudah_bacaState();
}

class _Sub_tab_sudah_bacaState extends State<Sub_tab_sudah_baca> {
  final config = ConfigApp();

  bool loadData = false;
  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Info_sudah_baca_provider>(context).getInfoSudahBaca();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final info = Provider.of<Info_sudah_baca_provider>(context);
    return Container(
        padding: EdgeInsets.only(
          left: 30,
          right: 30,
        ),
        child: ListView.builder(
            itemCount: info.list != null
                ? info.list!.length == 0
                    ? 1
                    : info.list!.length
                : 1,
            itemBuilder: (BuildContext context, int index) {
              if (info.list == null) {
                return AllBoxLoading();
              } else {
                if (info.list!.length == 0) {
                  // return NotfoundInfoWidget(config: config);
                  return NotfoundWidget(config: config, label: "Daftar Info");
                } else {
                  if (index == 0) {
                    return Column(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        BoxInfo(
                            config: config,
                            id: info.list![index.toString()]['id'].toString(),
                            title: info.list![index.toString()]['title']
                                .toString(),
                            desc: info.list![index.toString()]['desc']
                                .toString()),
                      ],
                    );
                  } else {
                    return BoxInfo(
                        config: config,
                        id: info.list![index.toString()]['id'].toString(),
                        title: info.list![index.toString()]['title'].toString(),
                        desc: info.list![index.toString()]['desc'].toString());
                  }
                }
              }
            }));
  }
}

class Sub_tab_belum_baca extends StatefulWidget {
  Sub_tab_belum_baca({
    super.key,
  });

  @override
  State<Sub_tab_belum_baca> createState() => _Sub_tab_belum_bacaState();
}

class _Sub_tab_belum_bacaState extends State<Sub_tab_belum_baca> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Info_belum_baca_provider>(context).getInfoBelumBaca();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final info = Provider.of<Info_belum_baca_provider>(context);
    return Container(
        padding: EdgeInsets.only(
          left: 30,
          right: 30,
        ),
        child: ListView.builder(
            itemCount: info.list != null
                ? info.list!.length == 0
                    ? 1
                    : info.list!.length
                : 1,
            itemBuilder: (BuildContext context, int index) {
              if (info.list == null) {
                return AllBoxLoading();
              } else {
                if (info.list!.length == 0) {
                  return NotfoundWidget(config: config, label: "Daftar Info");
                } else {
                  if (index == 0) {
                    return Column(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        BoxInfo(
                            config: config,
                            id: info.list![index.toString()]['id'].toString(),
                            title: info.list![index.toString()]['title']
                                .toString(),
                            desc: info.list![index.toString()]['desc']
                                .toString()),
                      ],
                    );
                  } else {
                    return BoxInfo(
                        config: config,
                        id: info.list![index.toString()]['id'].toString(),
                        title: info.list![index.toString()]['title'].toString(),
                        desc: info.list![index.toString()]['desc'].toString());
                  }
                }
              }
            }));
  }
}

class BoxInfo extends StatelessWidget {
  const BoxInfo(
      {super.key,
      required this.config,
      required this.id,
      required this.title,
      required this.desc});

  final ConfigApp config;
  final String id;
  final String title;
  final String desc;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) =>
                    Detail_info(id: id, title: title, desc: desc)));
      },
      child: Container(
          // decoration: BoxDecoration(color: Colors.white),
          // padding: EdgeInsets.only(left: 10, right: 10, top: 15, bottom: 5),
          padding: EdgeInsets.only(left: 10, right: 10, top: 5, bottom: 10),
          margin: EdgeInsets.only(top: 10, bottom: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.left,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: config.text_dark_color),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 0,
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                child: Text(
                  desc,
                  textAlign: TextAlign.justify,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 4,
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 13,
                      color: Colors.grey),
                ),
              ),
              SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    margin: EdgeInsets.only(right: 10, bottom: 10),
                    decoration: BoxDecoration(
                        // boxShadow: [
                        //   BoxShadow(
                        //     color: config.color_shadow,
                        //     spreadRadius: 2,
                        //     blurRadius: 7,
                        //     offset: Offset(0, 3),
                        //   ),
                        // ],
                        color: config.background_color,
                        borderRadius: BorderRadius.circular(5)),
                    child: Icon(
                      FontAwesomeIcons.copy,
                      color: config.text_light_color,
                      size: 15,
                    ),
                  )
                ],
              ),
              // Divider()
            ],
          )),
    );
  }
}
