import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:currency_text_input_formatter/currency_text_input_formatter.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
// import '../../provider/TransactionProvider.dart';
import '../../provider/TransferSaldoProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
// import '../transaksi/daftar_produk.dart';

class Form_transfer_saldo extends StatefulWidget {
  Form_transfer_saldo({super.key});

  @override
  State<Form_transfer_saldo> createState() => _Form_transfer_saldoState();
}

class _Form_transfer_saldoState extends State<Form_transfer_saldo> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  var nomorTujuanController = new TextEditingController();
  var nominalTransferController = new TextEditingController();
  @override
  Widget build(BuildContext context) {
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
            'Transfer Saldo',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: config.text_light_color),
          ),
        ),
        backgroundColor: Colors.grey[200],
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Form(
                key: _formKey,
                child: Container(
                    padding: EdgeInsets.only(
                        left: 20, right: 20, top: 0, bottom: 25),
                    child: ListView(children: [
                      SizedBox(
                        height: 10,
                      ),
                      Container(
                        padding:
                            EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                        margin:
                            EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                        height: 260,
                        decoration: BoxDecoration(
                            color: config.text_light_color,
                            borderRadius: BorderRadius.circular(10)),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Nomor Tujuan',
                              style: GoogleFonts.ptSans(
                                  textStyle:
                                      Theme.of(context).textTheme.headline4,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: config.text_dark_color),
                            ),
                            SizedBox(
                              height: 10,
                            ),
                            TextFormField(
                              onSaved: (val) {
                                setState(() {
                                  nomorTujuanController.text = val.toString();
                                });
                              },
                              style: GoogleFonts.ptSans(
                                  textStyle:
                                      Theme.of(context).textTheme.headline4,
                                  fontSize: 12,
                                  color: config.text_dark_color),
                              enableSuggestions: false,
                              autocorrect: false,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: 'Nomor Tujuan',
                                hintStyle: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 12,
                                    color: config.text_dark_color),
                                floatingLabelBehavior:
                                    FloatingLabelBehavior.never,
                                filled: true,
                                fillColor: config.input_grey_color,
                                contentPadding: const EdgeInsets.symmetric(
                                    vertical: 15.0, horizontal: 10.0),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: new BorderRadius.circular(5.0),
                                  borderSide: BorderSide(
                                      color: config.input_light_color),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: new BorderRadius.circular(5.0),
                                  borderSide: BorderSide(
                                      color: config.input_light_color),
                                ),
                              ),
                            ),
                            SizedBox(
                              height: 10,
                            ),
                            Text(
                              'Nominal Transfer',
                              style: GoogleFonts.ptSans(
                                  textStyle:
                                      Theme.of(context).textTheme.headline4,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: config.text_dark_color),
                            ),
                            SizedBox(
                              height: 10,
                            ),
                            TextFormField(
                              onSaved: (val) {
                                setState(() {
                                  nominalTransferController.text =
                                      val.toString();
                                });
                              },
                              style: GoogleFonts.ptSans(
                                  textStyle:
                                      Theme.of(context).textTheme.headline4,
                                  fontSize: 12,
                                  color: config.text_dark_color),
                              enableSuggestions: false,
                              autocorrect: false,
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                CurrencyTextInputFormatter(
                                  locale: 'ID',
                                  decimalDigits: 0,
                                  symbol: 'Rp ',
                                )
                              ],
                              decoration: InputDecoration(
                                hintText: 'Nominal Transfer',
                                hintStyle: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 12,
                                    color: config.text_dark_color),
                                floatingLabelBehavior:
                                    FloatingLabelBehavior.never,
                                filled: true,
                                fillColor: config.input_grey_color,
                                contentPadding: const EdgeInsets.symmetric(
                                    vertical: 15.0, horizontal: 10.0),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: new BorderRadius.circular(5.0),
                                  borderSide: BorderSide(
                                      color: config.input_light_color),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: new BorderRadius.circular(5.0),
                                  borderSide: BorderSide(
                                      color: config.input_light_color),
                                ),
                              ),
                            ),
                            SizedBox(
                              height: 15,
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                      onPressed: () async {
                                        _formKey.currentState!.save();

                                        var err = false;
                                        var err_msg = '';
                                        if (nomorTujuanController.text == '') {
                                          err_msg += 'Nomor tujuan wajib diisi';
                                          err = true;
                                        }
                                        if (nominalTransferController.text ==
                                            '') {
                                          err_msg +=
                                              'Nominal Transfer wajib diisi';
                                          err = true;
                                        }
                                        if (err == false) {
                                          loader.isLoad = true;

                                          final transfer = Provider.of<
                                                  Transfer_saldo_provider>(
                                              context,
                                              listen: false);

                                          await transfer.transferSaldo(
                                              nomorTujuanController.text,
                                              nominalTransferController.text);

                                          if (transfer.error != null) {
                                            loader.isLoad = false;

                                            if (transfer.error == false) {
                                              await Provider.of<
                                                          Beranda_provider>(
                                                      context,
                                                      listen: false)
                                                  .get_data_beranda();
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      backgroundColor:
                                                          Colors.teal,
                                                      behavior: SnackBarBehavior
                                                          .floating,
                                                      content: Text(
                                                          transfer.errorMsg!,
                                                          style: GoogleFonts.ptSans(
                                                              textStyle: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .headline4,
                                                              fontSize: 12,
                                                              color: config
                                                                  .text_light_color))));
                                              Navigator.pop(context);
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      backgroundColor:
                                                          const Color.fromARGB(
                                                              255, 163, 57, 49),
                                                      behavior: SnackBarBehavior
                                                          .floating,
                                                      content: Text(
                                                          transfer.errorMsg!,
                                                          style: GoogleFonts.ptSans(
                                                              textStyle: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .headline4,
                                                              fontSize: 12,
                                                              color: config
                                                                  .text_light_color))));
                                            }
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(err_msg,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: config
                                                              .text_light_color))));
                                        }
                                      },
                                      child: Text(
                                        "Transfer",
                                        style: GoogleFonts.ptSans(
                                            textStyle: Theme.of(context)
                                                .textTheme
                                                .headline4,
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                            color: config.text_light_color),
                                      ),
                                      style: ButtonStyle(
                                        shape: MaterialStateProperty.all<
                                                RoundedRectangleBorder>(
                                            RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(5.0),
                                        )),
                                        backgroundColor:
                                            MaterialStateProperty.all(
                                                config.btn_primary_color),
                                        padding: MaterialStateProperty.all(
                                            EdgeInsets.only(
                                                top: 17,
                                                bottom: 16,
                                                left: 20,
                                                right: 20)),
                                      )),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )
                    ])),
              ),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}
