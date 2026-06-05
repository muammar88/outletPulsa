import "package:flutter/material.dart";
import '../../config/config.dart';

class NavBarWidget extends StatelessWidget {
  NavBarWidget({Key? key}) : super(key: key);

  final cnf = ConfigApp();

  @override
  Widget build(BuildContext context) {
    return Drawer(
        backgroundColor: cnf.background_color,
        child: Center(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              UserAccountsDrawerHeader(
                  accountName: Container(
                    color: Colors.white,
                    child: Text(
                      'Muammar Kadafi',
                      style: TextStyle(
                          color: cnf.text_light_color,
                          fontWeight: FontWeight.bold,
                          shadows: <Shadow>[
                            Shadow(
                              offset: Offset(0.0, 0.0),
                              blurRadius: 1.5,
                              color: Color.fromARGB(255, 158, 158, 158),
                            ),
                          ]),
                    ),
                  ),
                  accountEmail: Container(
                    color: Colors.white,
                    child: Text(
                      '085262802141',
                      style: TextStyle(
                          color: cnf.text_light_color,
                          shadows: <Shadow>[
                            Shadow(
                              offset: Offset(0.0, 0.0),
                              blurRadius: 1.5,
                              color: Color.fromARGB(255, 158, 158, 158),
                            ),
                          ]),
                    ),
                  ),
                  currentAccountPicture: CircleAvatar(
                      child: ClipOval(
                          child: Image.asset(
                    'assets/img/avatar-profil.png',
                    width: 90,
                    height: 90,
                    fit: BoxFit.cover,
                  ))),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      image: DecorationImage(
                        image: new AssetImage('assets/img/background.jpg'),
                        fit: BoxFit.cover,
                      ))),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/profile.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Profil',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(builder: (context) => ProfilPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/transaction.png',
                    // width: 90,
                    // height: 90,
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Riwayat Transaksi',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(builder: (context) => TransaksiPage()),
                    // );
                  }),
              ListTile(
                  contentPadding:
                      EdgeInsets.symmetric(vertical: 0.0, horizontal: 16.0),
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/transaction-outlet.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Riwayat Transaksi Outlet',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => OutletTransaksiPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/costumer-service.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Costumer Service',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {}),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/price.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Daftar Harga',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => DaftarHargaPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/product.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Daftar Produk',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => DaftarProdukPage()),
                    // );
                  }),
              Divider(
                // height: 3,
                color: Color(0xFFC3C8BC),
              ),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/keagenan.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Daftar Keagenan',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => DaftarKeagenanPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/transaksi_saldo.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Transfer Saldo',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => TransferSaldoPage()),
                    // );
                  }),
              Divider(
                // height: 3,
                color: Color(0xFFC3C8BC),
              ),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/laporan-harian.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Laporan Harian',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => LaporanHarianPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/laporan-outlet.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Laporan Outlet',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {
                    // Navigator.pop(context);
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => LaporanOutletPage()),
                    // );
                  }),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/pengaturan.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Pengaturan',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {}),
              ListTile(
                  minLeadingWidth: 10,
                  iconColor: Color(0xFFC3C8BC),
                  textColor: Color(0xFFC3C8BC),
                  leading: Image.asset(
                    'assets/img/logout.png',
                    fit: BoxFit.cover,
                  ),
                  title: Text(
                    'Logout',
                    style: TextStyle(fontSize: 15),
                  ),
                  onTap: () {}),
              SizedBox(
                height: 50,
              )
            ],
          ),
        ));
  }
}
