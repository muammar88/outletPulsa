import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/BerandaProvider.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/loadProvider.dart';
import 'akun_tab.dart';
import 'beranda_tab.dart';
import 'info_tab.dart';
import 'riwayat_tab.dart';

class Home_page extends StatefulWidget {
  const Home_page({super.key});

  @override
  State<Home_page> createState() => _Home_pageState();
}

class _Home_pageState extends State<Home_page> {
  final cnf = new ConfigApp();

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      new GlobalKey<RefreshIndicatorState>();

  bool loadData = false;

  int? _currentIndex;
  final config = ConfigApp();
  // final ConfigApp config;

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
  }

  @override
  void initState() {
    _currentIndex = 0;
    super.initState();
  }

  List<BottomNavigationBarItem> getItems() {
    return [
      BottomNavigationBarItem(
        icon: Icon(
          FontAwesomeIcons.houseChimneyWindow,
          size: 20,
        ),
        label: "Beranda",
        backgroundColor: config.text_dark_color,
      ),
      BottomNavigationBarItem(
          icon: Icon(
            FontAwesomeIcons.businessTime,
            size: 20,
          ),
          label: "Riwayat"),
      BottomNavigationBarItem(
          icon: Icon(
            FontAwesomeIcons.bell,
            size: 20,
          ),
          label: "Info"),
      BottomNavigationBarItem(
          icon: Icon(
            FontAwesomeIcons.userLarge,
            size: 20,
          ),
          label: "Akun"),
    ];
  }

  void onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: cnf.background_color,
        elevation: 0,
        centerTitle: false,
        title: TitleAppBar(),
      ),
      bottomNavigationBar: Container(
        color: cnf.background_tab,
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: BottomNavigationBar(
          backgroundColor: cnf.background_tab,
          elevation: 0,
          selectedItemColor: cnf.text_navy_color,
          unselectedItemColor: cnf.text_grey_color,
          selectedFontSize: 12,
          unselectedFontSize: 12,
          type: BottomNavigationBarType.fixed,
          currentIndex: _currentIndex!,
          items: getItems(),
          onTap: onTabTapped,
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

    // Scaffold();
  }
}

class TitleAppBar extends StatelessWidget {
  TitleAppBar({
    Key? key,
  }) : super(key: key);

  final cnf = new ConfigApp();

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10),
      child: Row(mainAxisAlignment: MainAxisAlignment.start, children: [
        Expanded(
          flex: 3,
          child: Row(
            children: [
              Container(
                margin: EdgeInsets.symmetric(horizontal: 10),
                child: Image.asset('assets/img/logo-cycle.png',
                    width: 25, height: 25),
              ),
              Expanded(
                child: Consumer<Beranda_provider>(
                    builder: (context, dataBeranda, child) => Container(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                dataBeranda.name!,
                                textAlign: TextAlign.left,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_light_color),
                              ),
                              Text(dataBeranda.nomor_whatsapp!,
                                  textAlign: TextAlign.left,
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headline4,
                                      fontSize: 11,
                                      fontWeight: FontWeight.normal,
                                      fontStyle: FontStyle.italic,
                                      color: cnf.text_light_color)),
                            ],
                          ),
                        )),
              ),
              InkWell(
                onTap: () {
                  loader.isLoad = true;
                  Provider.of<Beranda_provider>(context, listen: false)
                      .get_data_beranda();
                  loader.isLoad = false;
                },
                child: Container(
                  width: 25,
                  height: 25,
                  margin: EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10)),
                  child: Icon(
                    FontAwesomeIcons.repeat,
                    size: 15,
                    color: cnf.text_dark_color,
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
