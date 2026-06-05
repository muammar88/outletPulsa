import 'package:flutter/material.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:currency_text_input_formatter/currency_text_input_formatter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/AuthenticationProvider.dart';
import 'package:outletpulsa/provider/InfoAddDepositProvider.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/DepositProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
import '../../widget/allBoxLoading.dart';
import 'konfirmasi_deposit_saldo.dart';

class Form_input_deposit extends StatefulWidget {
  const Form_input_deposit({super.key});

  @override
  State<Form_input_deposit> createState() => _Form_input_depositState();
}

class _Form_input_depositState extends State<Form_input_deposit> {
  final config = ConfigApp();
  final List<String> bank = ['0:Bank Belum Didefinisi'];
  bool loadData = false;
  String? selectedBank;
  List<dynamic>? listBank;
  List<DropdownMenuItem> items = [];
  var nominalController = new TextEditingController();

  @override
  void didChangeDependencies() async {
    final auth = Provider.of<Authentication_provider>(context);
    if (auth.isLogin == true && loadData == false) {
      final info = await Provider.of<Info_add_deposit_provider>(context);
      info.get_info_add_deposit();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final listInfoDeposit = Provider.of<Info_add_deposit_provider>(context);
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
            'Tambah Saldo Deposit',\n            style: GoogleFonts.ptSans(\n                textStyle: Theme.of(context).textTheme.headlineLarge,\n                fontSize: 16,\n                fontWeight: FontWeight.bold,\n                color: config.text_light_color),
          ),
        ),
        backgroundColor: Colors.grey[200],
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Container(
                padding:
                    EdgeInsets.only(left: 20, right: 20, top: 0, bottom: 0),
                child: ListView(
                  children: [
                    SizedBox(
                      height: 25,
                    ),
                    Container(
                      padding:
                          EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                      margin:
                          EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                      // height: 180,
                      decoration: BoxDecoration(
                          color: config.text_light_color,
                          borderRadius: BorderRadius.circular(10)),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Nominal Deposit',\n                            style: GoogleFonts.ptSans(\n                                textStyle:\n                                    Theme.of(context).textTheme.headlineLarge,\n                                fontSize: 13,\n                                fontWeight: FontWeight.bold,\n                                color: config.text_dark_color),
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          TextFormField(
                            controller: nominalController,
                            onSaved: (val) {
                              setState(() {
                                nominalController.text = val.toString();
                              });
                            },
                            validator: (text) {
                              if (text == null || text.isEmpty) {
                                return 'Password tidak boleh kosong';
                              }
                              return null;
                            },
                            enableSuggestions: false,
                            autocorrect: false,
                            inputFormatters: [
                              CurrencyTextInputFormatter(
                                locale: 'ID',
                                decimalDigits: 0,
                                symbol: 'Rp ',
                              )
                            ],
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headline4,
                                fontSize: 12,
                                color: config.text_dark_color),
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              hintText: "Nominal Deposit",
                              hintStyle: GoogleFonts.ptSans(
                                  textStyle:\n                                      Theme.of(context).textTheme.headlineLarge,\n                                  fontSize: 12,\n                                  color: config.text_dark_color),
                              floatingLabelBehavior:
                                  FloatingLabelBehavior.never,
                              filled: true,
                              fillColor: config.input_grey_color,
                              contentPadding: const EdgeInsets.symmetric(
                                  vertical: 15.0, horizontal: 10.0),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: new BorderRadius.circular(5.0),
                                borderSide:
                                    BorderSide(color: config.input_light_color),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: new BorderRadius.circular(5.0),
                                borderSide:
                                    BorderSide(color: config.input_light_color),
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 10,
                          ),
                          Text(
                            'Bank Tujuan Transfer',
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
                          DropdownButtonFormField2(
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: Color.fromARGB(255, 235, 235, 235),
                              contentPadding: const EdgeInsets.symmetric(
                                  vertical: 10.0, horizontal: 0.0),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: new BorderRadius.circular(5.0),
                                borderSide: BorderSide(color: Colors.white),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: new BorderRadius.circular(5.0),
                                borderSide: BorderSide(color: Colors.white),
                              ),
                              isDense: true,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(5),
                                borderSide:
                                    BorderSide(color: config.text_dark_color),
                              ),
                            ),
                            isExpanded: true,
                            hint: const Text(
                              'Pilih Bank Tujuan Transfer',
                              style: TextStyle(fontSize: 12),
                            ),
                            items: (listInfoDeposit.list_select_bank ?? bank)
                                .map((item) => DropdownMenuItem<String>(
                                      value: item.split(':')[0],
                                      child: Text(
                                        'Bank ' + item.split(':')[1],
                                        style: const TextStyle(
                                          fontSize: 12,
                                        ),
                                      ),
                                    ))
                                .toList(),
                            value: selectedBank,
                            validator: (value) {
                              if (value == null) {
                                return 'Bank transfer tidak boleh kosong';
                              }
                            },
                            onChanged: (value) {
                              selectedBank = value.toString();
                            },
                            onSaved: (value) {
                              selectedBank = value.toString();
                            },
                          ),
                          SizedBox(
                            height: 15,
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                    onPressed: () async {
                                      var err = false;
                                      var err_msg = '';
                                      if (nominalController.text == null ||
                                          nominalController.text == '') {
                                        err_msg +=
                                            'Nominal Tidak Boleh Kosong.\n';
                                        err = true;
                                      }
                                      if (selectedBank == null ||
                                          selectedBank == 0) {
                                        err_msg +=
                                            'Anda Wajib Memilih Salah Satu Bank Tujuan Transfer. ';
                                        err = true;
                                      }
                                      if (err == false) {
                                        loader.isLoad = true;
                                        final deposit =
                                            Provider.of<Deposit_provider>(
                                                context,
                                                listen: false);
                                        var feedBack =
                                            await deposit.depositSaldo(
                                                nominalController.text,
                                                selectedBank!);
                                        if (feedBack.error == false) {
                                          loader.isLoad = false;
                                          //get beranda
                                          Provider.of<Beranda_provider>(context,
                                                  listen: false)
                                              .get_data_beranda();

                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor: Colors.teal,
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: config
                                                              .text_light_color))));
                                          Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      Konfirmasi_deposit_saldo()));
                                        } else {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: config
                                                              .text_light_color))));
                                        }
                                      } else {
                                        loader.isLoad = false;
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
                                      "Ambil Tiket Deposit",
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
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    listInfoDeposit.pesan != null
                        ? Container(
                            //
                            child: ListView(
                              shrinkWrap: true,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      margin: EdgeInsets.symmetric(
                                          vertical: 10, horizontal: 15),
                                      child: Text(
                                        'Catatan Deposit',
                                        textAlign: TextAlign.left,
                                        style: GoogleFonts.ptSans(
                                            textStyle: Theme.of(context)
                                                .textTheme
                                                .headline4,
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                            color: config.text_dark_color),
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                    padding:
                                        EdgeInsets.only(left: 30, right: 30),
                                    child: Text(
                                      listInfoDeposit.pesan!,
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headline4,
                                          fontSize: 13,
                                          color: config.text_dark_color),
                                    )),
                                SizedBox(
                                  height: 20,
                                )
                              ],
                            ),
                          )
                        : SizedBox(),
                  ],
                ),
              ),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}
