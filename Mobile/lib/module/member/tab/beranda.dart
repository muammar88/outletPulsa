import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../config/config.dart';
import '../../../provider/BerandaProvider.dart';
import '../../../provider/loadProvider.dart';
import '../widget/beranda/deposit/form_input_deposit.dart';
import '../widget/beranda/deposit/konfirmasi_deposit_saldo.dart';
import '../widget/beranda/transaksi/daftar_kategori.dart';
import '../widget/beranda/transaksi/daftar_kategori_pascabayar.dart';
import '../widget/beranda/transaksi/input_ppob.dart';

class Beranda_tab extends StatefulWidget {
  const Beranda_tab({
    Key? key,
    required GlobalKey<RefreshIndicatorState> refreshIndicatorKey,
    required this.config,
  })  : _refreshIndicatorKey = refreshIndicatorKey,
        super(key: key);

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey;
  final ConfigApp config;

  @override
  State<Beranda_tab> createState() => _Beranda_tabState();
}

class _Beranda_tabState extends State<Beranda_tab> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    var l = await Provider.of<Load_provider>(context, listen: false);
    if (loadData == false) {
      await Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
      l.isLoad = false;
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<Load_provider>(
        builder: (context, loader, child) => Stack(
              children: [
                Center(
                  child: Container(
                      color: Colors.white, // Modern clean white background
                      child: Stack(
                    children: [
                      Positioned(
                        top: 0.0,
                        left: 0.0,
                        right: 0.0,
                        child: Container(
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(30),
                              bottomRight: Radius.circular(30),
                            )
                          ),
                        ),
                      ),
                      Positioned(
                        top: 40.0, // Adjusted to match new card shadow
                        left: 0.0,
                        right: 0.0,
                        bottom: 0.0, // ADDED bottom constraint so it stops at the nav bar
                        child: Container(
                          padding: EdgeInsets.only(top: 30, left: 25, right: 25),
                          child: ListView(
                              children: [
                                SizedBox(height: 40),
                                Container(
                                    child: Text(
                                      'Prabayar',
                                      style: GoogleFonts.poppins(
                                          textStyle: Theme.of(context).textTheme.headlineMedium,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: widget.config.text_dark_color),
                                    )),
                                SizedBox(height: 20),
                                Container(
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Pulsa\nReguler', title: 'Pulsa Reguler', path: 'PIU', icon: TablerIcons.device_mobile, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Pulsa\nTransfer', title: 'Pulsa Transfer', path: 'PT', icon: TablerIcons.arrows_exchange, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Paket\nData', title: 'Paket Data', path: 'PD', icon: TablerIcons.wifi, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Paket\nTelpon', title: 'Paket Telpon', path: 'PTP', icon: TablerIcons.phone_call, tipe: 'prabayar')),
                                        ],
                                      ),
                                      SizedBox(height: 15),
                                      Row(
                                        children: [
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Paket\nSMS', title: 'Paket SMS', path: 'PS', icon: TablerIcons.message, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Pulsa\nInternasional', title: 'Pulsa International', path: 'PI', icon: TablerIcons.world, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Token\nListrik', title: 'Token Listrik', path: 'TL', icon: TablerIcons.bolt, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Uang\nDigital', title: 'Uang Digital', path: 'UD', icon: TablerIcons.wallet, tipe: 'prabayar')),
                                        ],
                                      ),
                                      SizedBox(height: 15),
                                      Row(
                                        children: [
                                          Expanded(child: BoxProduk(config: widget.config, label: 'Wifi ID', title: 'Wifi ID', path: 'WIFI', icon: TablerIcons.router, tipe: 'prabayar')),
                                          Expanded(child: BoxProduk(config: widget.config, label: 'E-Toll', title: 'E-Toll', path: 'ET', icon: TablerIcons.car, tipe: 'prabayar')),
                                          Expanded(child: SizedBox()),
                                          Expanded(child: SizedBox()),
                                        ],
                                      ),
                                      SizedBox(height: 25),
                                    ],
                                  ),
                                ),
                                Container(
                                    child: Text(
                                      'Pascabayar',
                                      style: GoogleFonts.poppins(
                                          textStyle: Theme.of(context).textTheme.headlineMedium,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: widget.config.text_dark_color),
                                    )),
                                SizedBox(height: 20),
                                Container(
                                    child: Column(children: [
                                  Row(
                                    children: [
                                      Expanded(child: BoxProduk(config: widget.config, label: 'PLN\nPascabayar', title: 'PLN Pascabayar', path: 'PLNPASCABAYAR', icon: TablerIcons.bolt, tipe: 'pascabayar')),
                                      Expanded(child: BoxProduk(config: widget.config, label: 'Telkom', title: 'Telkom', path: 'TELKOM', icon: TablerIcons.phone, tipe: 'pascabayar')),
                                      Expanded(child: BoxProduk(config: widget.config, label: 'PDAM', title: 'PDAM', path: 'PDAM', icon: TablerIcons.droplet, tipe: 'pascabayar')),
                                      Expanded(child: BoxProduk(config: widget.config, label: 'BPJS', title: 'BPJS', path: 'BPJS', icon: TablerIcons.heartbeat, tipe: 'pascabayar')),
                                    ],
                                  ),
                                  SizedBox(height: 15),
                                  Row(
                                    children: [
                                      Expanded(child: BoxProduk(config: widget.config, label: 'TV\nPascabayar', title: 'TV Pascabayar', path: 'TVK', icon: TablerIcons.device_tv, tipe: 'pascabayar')),
                                      Expanded(child: BoxProduk(config: widget.config, label: 'PGN', title: 'PNG', path: 'PGN', icon: TablerIcons.flame, tipe: 'pascabayar')),
                                      Expanded(child: BoxProduk(config: widget.config, label: 'Internet', title: 'Internet', path: 'INT', icon: TablerIcons.globe, tipe: 'pascabayar')),
                                      Expanded(child: SizedBox()),
                                    ],
                                  ),
                                  SizedBox(height: 100), // Extra padding for bottom nav
                                ]))
                              ],
                            ),
                          ),
                        ),
                      Positioned(
                        top: 5.0,
                        left: 25.0,
                        right: 25.0,
                        child: Container(
                          height: 80, // Increased height for modern look
                          padding: EdgeInsets.symmetric(vertical: 15, horizontal: 25),
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.15),
                                  spreadRadius: 2,
                                  blurRadius: 20,
                                  offset: Offset(0, 8),
                                ),
                              ],
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20)),
                          child: Consumer<Beranda_provider>(
                              builder: (context, dataBeranda, child) => Row(
                                    children: [
                                      Expanded(
                                          child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          loader.isLoad == true
                                              ? LoadWidgetDepositSaya(config: widget.config)
                                              : Text(
                                                  'Deposit Saya',
                                                  style: GoogleFonts.poppins(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.w500,
                                                      color: Colors.grey.shade600),
                                                ),
                                          SizedBox(height: 2),
                                          loader.isLoad == true
                                              ? LoadWidgetSaldo(config: widget.config)
                                              : Text(
                                                  dataBeranda.saldo != null
                                                      ? "Rp ${dataBeranda.saldo!.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}"
                                                      : "Rp 0",
                                                  style: GoogleFonts.poppins(
                                                      fontSize: 18,
                                                      fontWeight: FontWeight.bold,
                                                      color: widget.config.text_navy_color),
                                                ),
                                        ],
                                      )),
                                      Container(
                                        height: 40,
                                        child: VerticalDivider(
                                          color: Colors.grey.shade200,
                                          thickness: 2,
                                          width: 30,
                                        ),
                                      ),
                                      Expanded(
                                          child: ButtonAddSaldo(
                                              config: widget.config,
                                              isDisabled: dataBeranda.status_deposit == true)),
                                    ],
                                  )),
                        ),
                      ),
                    ],
                  )),
                ),
              ],
            ));
  }
}

class LoadWidgetSaldo extends StatelessWidget {
  const LoadWidgetSaldo({super.key, required this.config});
  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 5),
      height: 18,
      width: 80,
      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
    );
  }
}

class LoadWidgetDepositSaya extends StatelessWidget {
  const LoadWidgetDepositSaya({super.key, required this.config});
  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 12,
      width: 70,
      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
    );
  }
}

class ButtonAddSaldo extends StatelessWidget {
  const ButtonAddSaldo({super.key, required this.config, this.isDisabled = false});
  final ConfigApp config;
  final bool isDisabled;

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return InkWell(
      onTap: isDisabled ? null : () {
        Navigator.push(context, MaterialPageRoute(builder: (context) => Form_input_deposit()));
      },
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: BoxDecoration(
          color: isDisabled ? Colors.grey.shade200 : config.text_navy_color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15)
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            loader.isLoad == true
                ? Container(
                    height: 12,
                    width: 40,
                    decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(2)),
                  )
                : Expanded(
                    child: Text('Isi Saldo',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDisabled ? Colors.grey.shade500 : config.text_navy_color)),
                  ),
            SizedBox(width: 5),
            loader.isLoad == true
                ? Container(
                    height: 20,
                    width: 20,
                    decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(10)),
                  )
                : Icon(
                    TablerIcons.circle_plus,
                    size: 20,
                    color: isDisabled ? Colors.grey.shade500 : config.text_navy_color,
                  ),
          ],
        ),
      ),
    );
  }
}

class BoxProduk extends StatelessWidget {
  const BoxProduk({
    super.key,
    required this.config,
    required this.label,
    required this.title,
    required this.path,
    required this.icon,
    required this.tipe
  });

  final ConfigApp config;
  final String label;
  final String title;
  final String path;
  final IconData icon;
  final String tipe;

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return InkWell(
      onTap: () {
        if (tipe == 'prabayar') {
          if (path == 'PIU' || path == 'PT' || path == 'PD' || path == 'PTP' || path == 'PS' || path == 'TL') {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => Input_ppob(
                        label: label,
                        title: title,
                        path: path,
                        tipe: tipe,
                        checkPrefix: true,
                      )),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => Daftar_kategori(label: label, title: title, path: path, tipe: tipe)),
            );
          }
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => Daftar_kategori_pascabayar(label: label, title: title, path: path, tipe: tipe)),
          );
        }
      },
      child: Container(
          height: 105,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              loader.isLoad == true
                  ? Container(
                      width: 55,
                      height: 55,
                      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(15)),
                    )
                  : Container(
                      width: 55,
                      height: 55,
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              spreadRadius: 2,
                              blurRadius: 15,
                              offset: Offset(0, 5),
                            ),
                          ],
                      ),
                      child: Icon(icon, color: config.text_navy_color, size: 25),
                    ),
              SizedBox(height: 10),
              loader.isLoad == true
                  ? Container(
                      width: 40,
                      height: 8,
                      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(2)),
                    )
                  : Text(
                      label,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.poppins(
                          fontSize: 11,
                          height: 1.2,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87),
                    ),
            ],
          )),
    );
  }
}
