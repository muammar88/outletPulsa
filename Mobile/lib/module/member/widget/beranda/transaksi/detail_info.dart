import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../provider/InfoBelumBacaProvider.dart';
import '../../../../../provider/UpdateStatusBacaProvider.dart';

class Detail_info extends StatefulWidget {
  const Detail_info(
      {super.key, required this.id, required this.title, required this.desc});

  final String id;
  final String title;
  final String desc;

  @override
  State<Detail_info> createState() => _Detail_infoState();
}

class _Detail_infoState extends State<Detail_info> {
  final config = ConfigApp();

  bool loadData = false;
  bool update = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Update_status_baca_provider>(context, listen: false)
          .updateStatusBaca(widget.id);
      await Provider.of<Info_belum_baca_provider>(context, listen: false)
          .getInfoBelumBaca();
      loadData = true;
      update = true;
    }
    if (update == true) {
      update = false;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: config.background_color,
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
          'Detail Info',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      body: Container(
        padding: EdgeInsets.only(left: 30, right: 30, top: 25, bottom: 25),
        child: Container(
          decoration: BoxDecoration(
              color: config.background_light_color,
              borderRadius: BorderRadius.circular(10)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 10,
              ),
              Row(
                children: [
                  Expanded(
                    child: Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        child: Text(
                          widget.title,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headlineMedium,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color),
                        )),
                  ),
                ],
              ),
              // Divider(),
              Expanded(
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  child: Text(
                    widget.desc,
                    textAlign: TextAlign.justify,
                    style: GoogleFonts.ptSans(
                        textStyle: Theme.of(context).textTheme.headlineMedium,
                        fontSize: 14,
                        // fontWeight: FontWeight.bold,
                        color: Colors.grey),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
