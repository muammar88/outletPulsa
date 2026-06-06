import 'dart:async';
import 'dart:convert';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:bluetooth_print/bluetooth_print_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import '../provider/DetailPascabayarProvider.dart';

class PrintPascabayar extends StatefulWidget {
  const PrintPascabayar({super.key, required this.kodeTrans});

  final String kodeTrans;

  @override
  State<PrintPascabayar> createState() => _PrintPascabayarState();
}

class _PrintPascabayarState extends State<PrintPascabayar> {
  final config = ConfigApp();

  BluetoothPrint bluetoothPrint = BluetoothPrint.instance;

  bool _connected = false;
  BluetoothDevice? _device;
  String tips = 'NO DEVICE CONNECT';

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) => initBluetooth());
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initBluetooth() async {
    bluetoothPrint.startScan(timeout: Duration(seconds: 4));

    bool isConnected = await bluetoothPrint.isConnected ?? false;

    bluetoothPrint.state.listen((state) {
      print('******************* cur device status: $state');

      switch (state) {
        case BluetoothPrint.CONNECTED:
          setState(() {
            _connected = true;
            tips = 'CONNECT SUCCESS';
          });
          break;
        case BluetoothPrint.DISCONNECTED:
          setState(() {
            _connected = false;
            tips = 'DISCONNECT SUCCESS';
          });
          break;
        default:
          break;
      }
    });

    if (!mounted) {
      print('not mount');
      return;
    }

    if (isConnected) {
      setState(() {
        tips = 'ALREADY CONNECTED';
        _connected = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = Provider.of<Detail_pascabayar_provider>(context);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: config.background_smooth_navy,
        centerTitle: true,
        title: Text(
          'Cetak Struk Pascabayar',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () =>
            bluetoothPrint.startScan(timeout: Duration(seconds: 4)),
        child: SingleChildScrollView(
          child: Column(
            children: <Widget>[
              SizedBox(
                height: 15,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: 10, horizontal: 10),
                    child: Container(
                        child: Text(
                      tips,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    )),
                  ),
                ],
              ),
              SizedBox(
                height: 5,
              ),
              Divider(),
              StreamBuilder<List<BluetoothDevice>>(
                stream: bluetoothPrint.scanResults,
                initialData: [],
                builder: (c, snapshot) => Column(
                  children: snapshot.data!
                      .map((d) => Container(
                            child: ListTile(
                              title: Text(d.name ?? ''),
                              subtitle: Text(d.address ?? ''),
                              onTap: () async {
                                setState(() {
                                  _device = d;
                                });
                              },
                              trailing: _device != null &&
                                      _device!.address == d.address
                                  ? Icon(
                                      Icons.check,
                                      color: Colors.green,
                                    )
                                  : null,
                            ),
                          ))
                      .toList(),
                ),
              ),
              Divider(),
              Container(
                padding: EdgeInsets.fromLTRB(20, 5, 20, 10),
                child: Column(
                  children: <Widget>[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Expanded(
                          child: OutlinedButton(
                            style: ButtonStyle(
                              padding: MaterialStateProperty.all<EdgeInsets>(
                                  EdgeInsets.all(15)),
                              foregroundColor: MaterialStateProperty.all<Color>(
                                  config.background_color),
                              shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5.0),
                                      side: BorderSide(
                                          color: config.background_color))),
                              backgroundColor: MaterialStateProperty.all(
                                  _connected
                                      ? config.input_grey_color
                                      : config.background_color),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  TablerIcons.wifi,
                                  size: 15,
                                  color: _connected
                                      ? config.text_light_color
                                      : config.text_light_color,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text('Connect',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headlineMedium,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: _connected
                                            ? config.text_light_color
                                            : config.text_light_color))
                              ],
                            ),
                            onPressed: _connected
                                ? () async {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                            backgroundColor: Colors.red,
                                            behavior: SnackBarBehavior.floating,
                                            content: Text(
                                                'ALREADY CONNECTED',
                                                style: GoogleFonts.ptSans(
                                                    textStyle: Theme.of(context)
                                                        .textTheme
                                                        .headlineMedium,
                                                    fontSize: 12,
                                                    color: config
                                                        .text_light_color))));
                                  }
                                : () async {
                                    if (_device != null &&
                                        _device!.address != null) {
                                      setState(() {
                                        tips = 'CONNECTING...';
                                      });
                                      await bluetoothPrint.connect(_device!);
                                    } else {
                                      setState(() {
                                        tips = 'please select device';
                                      });
                                      print('please select device');
                                    }
                                  },
                          ),
                        ),
                        SizedBox(width: 10.0),
                        Expanded(
                          child: OutlinedButton(
                            style: ButtonStyle(
                              padding: MaterialStateProperty.all<EdgeInsets>(
                                  EdgeInsets.all(15)),
                              foregroundColor: MaterialStateProperty.all<Color>(
                                  _connected
                                      ? Colors.red
                                      : config.input_grey_color),
                              shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5.0),
                                      side: BorderSide(
                                          color: _connected
                                              ? Colors.red
                                              : config.input_grey_color))),
                              backgroundColor: MaterialStateProperty.all(
                                  _connected
                                      ? Colors.red
                                      : config.input_grey_color),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  TablerIcons.x,
                                  size: 15,
                                  color: config.text_light_color,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text('Disconnect',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headlineMedium,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: config.text_light_color))
                              ],
                            ),
                            onPressed: _connected
                                ? () async {
                                    setState(() {
                                      tips = 'DISCONNECTING...';
                                    });
                                    await bluetoothPrint.disconnect();
                                  }
                                : () async {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                            backgroundColor: Colors.red,
                                            behavior: SnackBarBehavior.floating,
                                            content: Text(
                                                'NOT CONNECTED',
                                                style: GoogleFonts.ptSans(
                                                    textStyle: Theme.of(context)
                                                        .textTheme
                                                        .headlineMedium,
                                                    fontSize: 12,
                                                    color: config
                                                        .text_light_color))));
                                  },
                          ),
                        ),
                      ],
                    ),
                    Divider(),
                    Divider(),
                    Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Expanded(
                            child: OutlinedButton(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    TablerIcons.printer,
                                    size: 15,
                                    color: config.text_light_color,
                                  ),
                                  SizedBox(
                                    width: 10,
                                  ),
                                  Text('Cetak Struk',
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headlineMedium,
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: config.text_light_color))
                                ],
                              ),
                              style: ButtonStyle(
                                padding: MaterialStateProperty.all<EdgeInsets>(
                                    EdgeInsets.all(15)),
                                foregroundColor:
                                    MaterialStateProperty.all<Color>(
                                        Colors.teal),
                                shape: MaterialStateProperty.all<
                                        RoundedRectangleBorder>(
                                    RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(5.0),
                                        side: BorderSide(color: Colors.teal))),
                                backgroundColor:
                                    MaterialStateProperty.all(Colors.teal),
                              ),
                              onPressed: _connected
                                  ? () async {
                                      print("tesss");
                                      Map<String, dynamic> config = Map();
                                      config['width'] = 100;
                                      config['height'] = 70;
                                      config['gap'] = 2;

                                      List<LineText> list = [];

                                      list.add(LineText(
                                          fontZoom: 1,
                                          type: LineText.TYPE_TEXT,
                                          content: 'STRUK BUKTI PEMBAYARAN',
                                          weight: 0,
                                          align: LineText.ALIGN_CENTER,
                                          size: 0,
                                          linefeed: 1));
                                      list.add(LineText(
                                          size: 0,
                                          fontZoom: 1,
                                          type: LineText.TYPE_TEXT,
                                          content: 'TAGIHAN LISTRIK PASCABAYAR',
                                          weight: 0,
                                          align: LineText.ALIGN_CENTER,
                                          linefeed: 1));

                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content:
                                              '================================',
                                          weight: 1,
                                          align: LineText.ALIGN_CENTER,
                                          fontZoom: 2,
                                          linefeed: 1));
                                      list.add(LineText(linefeed: 1));

                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'Nomor Referensi :',
                                          align: LineText.ALIGN_CENTER,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: detail.noref,
                                          align: LineText.ALIGN_CENTER,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: detail.tanggal! +
                                              ' ' +
                                              detail.waktu! +
                                              ' \n',
                                          align: LineText.ALIGN_CENTER,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'ID Transaksi  : #' +
                                              widget.kodeTrans,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'ID Pelanggan  : ' +
                                              detail.nomorTujuan!,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'NAMA          : ' +
                                              detail.namaPelanggan!,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'TARIF/DAYA    :' +
                                              detail.tarif! +
                                              '/' +
                                              detail.daya!,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'BIAYA ADMIN   : ' +
                                              detail.biayaAdmin!,
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));
                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          content: 'TOTAL BIAYA   : ' +
                                              detail.total! +
                                              ' \n',
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));

                                      list.add(LineText(
                                          type: LineText.TYPE_TEXT,
                                          align: LineText.ALIGN_CENTER,
                                          content:
                                              'PLN menyatakan struk ini sebagai bukti pembayaran sah, mohon disimpan \n',
                                          weight: 0,
                                          fontZoom: 1,
                                          linefeed: 1));

                                      List<LineText> list1 = [];

                                      await bluetoothPrint.printLabel(
                                          config, list);
                                    }
                                  : null,
                            ),
                          )
                        ])
                  ],
                ),
              )
            ],
          ),
        ),
      ),
      floatingActionButton: StreamBuilder<bool>(
        stream: bluetoothPrint.isScanning,
        initialData: false,
        builder: (c, snapshot) {
          if (snapshot.data == true) {
            return FloatingActionButton(
              child: Icon(Icons.stop),
              onPressed: () => bluetoothPrint.stopScan(),
              backgroundColor: Colors.red,
            );
          } else {
            return FloatingActionButton(
                backgroundColor: config.background_color,
                child: Icon(Icons.search),
                onPressed: () =>
                    bluetoothPrint.startScan(timeout: Duration(seconds: 4)));
          }
        },
      ),
    );
  }
}

