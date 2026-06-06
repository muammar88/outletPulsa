import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/BerandaProvider.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/loadProvider.dart';
import 'tab/akun.dart';
import 'tab/beranda.dart';
import 'tab/info.dart';
import 'tab/riwayat.dart';

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
    });
  }

  List<BottomNavigationBarItem> getItems() {
    return [
      BottomNavigationBarItem(
        icon: Icon(
          TablerIcons.home,
          size: 20,
        ),
        label: "Beranda",
        backgroundColor: config.text_dark_color,
      ),
      BottomNavigationBarItem(
          icon: Icon(
            TablerIcons.history,
            size: 20,
          ),
          label: "Riwayat"),
      BottomNavigationBarItem(
          icon: Icon(
            TablerIcons.bell,
            size: 20,
          ),
          label: "Info"),
      BottomNavigationBarItem(
          icon: Icon(
            TablerIcons.user,
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
          unselectedItemColor: Colors.grey.shade400,
          selectedLabelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold),
          unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
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
                padding: EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
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
                                dataBeranda.name ?? "User",
                                textAlign: TextAlign.left,
                                style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_light_color),
                              ),
                              Text(dataBeranda.nomor_whatsapp ?? "",
                                  textAlign: TextAlign.left,
                                  style: GoogleFonts.poppins(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: cnf.text_light_color)),
                            ],
                          ),
                        )),
              ),
              InkWell(
                onTap: () async {
                  loader.isLoad = true;
                  await Provider.of<Beranda_provider>(context, listen: false)
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
                    TablerIcons.repeat,
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

