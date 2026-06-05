import 'package:flutter/material.dart';

class TitleHomeAppBarWidget extends StatelessWidget {
  TitleHomeAppBarWidget({Key? key, required this.currentIndex})
      : super(key: key);

  int currentIndex;
  //List<dynamic> headTab = ['Transaksi', 'Saldo', 'Outlet', 'Keagenan'];

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(mainAxisAlignment: MainAxisAlignment.start, children: [
        Expanded(
          flex: 3,
          child: Row(
            children: [
              Expanded(
                flex: 1,
                child: Container(
                  child: Image.asset('assets/img/logo-cycle.png',
                      width: 35, height: 35),
                ),
              ),
              Expanded(
                flex: 4,
                child: Container(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Hai, Muammar Kadafi",
                          textAlign: TextAlign.left,
                          style: TextStyle(
                              fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('085262802141',
                          textAlign: TextAlign.left,
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.normal))
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
        // Expanded(
        //   flex: 1,
        //   child: Container(
        //     margin: EdgeInsets.only(left: 10),
        //     child: Row(
        //       children: [
        //         Expanded(
        //           flex: 1,
        //           child: InkWell(
        //             onTap: () {
        //               //   final provRefresh = Provider.of<HomeProvider>(
        //               //       context,
        //               //       listen: false);
        //               //   provRefresh.changeisLoadingTrue();
        //               //   provRefresh.getDataHome();
        //             },
        //             child: Icon(
        //               Icons.logout_outlined,
        //               color: Colors.white,
        //               size: 24.0,
        //               semanticLabel:
        //                   'Text to announce in accessibility modes',
        //             ),
        //           ),
        //         ),
        //         // Expanded(
        //         //   flex: 1,
        //         //   child: InkWell(
        //         //     onTap: () {
        //         //       //   final authProv =
        //         //       //       Provider.of<AuthenticationProvider>(context,
        //         //       //           listen: false);
        //         //       //   authProv.logOut();
        //         //     },
        //         //     child: Icon(
        //         //       Icons.menu,
        //         //       color: Colors.white,
        //         //       size: 24.0,
        //         //       semanticLabel:
        //         //           'Text to announce in accessibility modes',
        //         //     ),
        //         //   ),
        //         // ),
        //       ],
        //     ),
        //   ),
        // )
      ]),
    );
  }
}
