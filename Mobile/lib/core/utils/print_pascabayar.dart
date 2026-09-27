import 'dart:async';
import 'dart:convert';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:bluetooth_print/bluetooth_print_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:bluetooth_print/bluetooth_print.dart';
import 'package:outletpulsa/shared/providers/DetailPascabayarProvider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';

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

  String formatRow(String left, String right, {int width = 32}) {
    int spaceCount = width - left.length - right.length;
    if (spaceCount < 1) {
      spaceCount = 1;
    }
    String spaces = List.filled(spaceCount, ' ').join();
    return left + spaces + right;
  }

  Widget _buildBrandPanel({bool compact = false}) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Positioned(top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(bottom: -40, left: -40, child: _Circle(size: 130, opacity: 0.04)),

            Positioned(
              top: compact ? 0 : 16,
              left: compact ? 0 : 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  margin: compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(TablerIcons.arrow_left, color: Colors.white, size: 20),
                ),
              ),
            ),

            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 48 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
                      ),
                      child: const Icon(TablerIcons.printer, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Cetak Struk',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Hubungkan printer bluetooth untuk mencetak',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 13 : 15,
                        color: Colors.white.withOpacity(0.85),
                        height: 1.5,
                      ),
                    ),
                    if (compact) const SizedBox(height: 48), // Added height so the white card doesn't overlap the text
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => initBluetooth());
  }
  
  Future<void> initBluetooth() async {
    bluetoothPrint.startScan(timeout: Duration(seconds: 4));

    bool isConnected = await bluetoothPrint.isConnected ?? false;

    bluetoothPrint.state.listen((state) {
      print('cur device status: $state');

      if (mounted) {
        switch (state) {
          case BluetoothPrint.CONNECTED:
            setState(() {
              _connected = true;
              tips = 'KONEKSI BERHASIL';
            });
            break;
          case BluetoothPrint.DISCONNECTED:
            setState(() {
              _connected = false;
              tips = 'TERPUTUS';
            });
            break;
          default:
            break;
        }
      }
    });

    if (!mounted) return;

    if (isConnected) {
      setState(() {
        _connected = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = Provider.of<Detail_pascabayar_provider>(context);
    final beranda = Provider.of<Beranda_provider>(context, listen: false);
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: RefreshIndicator(
        onRefresh: () => bluetoothPrint.startScan(timeout: Duration(seconds: 4)),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Column(
                    children: [
                      _buildBrandPanel(compact: true),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          child: Column(
                            children: [
                              const Spacer(),
                              Transform.translate(
                                offset: const Offset(0, -30),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F1F6E).withOpacity(0.08),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
              // Status Card
              Card(
                elevation: 0,
                color: _connected ? Colors.green.shade50 : Colors.red.shade50,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _connected ? Colors.green.shade100 : Colors.red.shade100,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _connected ? TablerIcons.bluetooth_connected : TablerIcons.bluetooth_off,
                          color: _connected ? Colors.green.shade700 : Colors.red.shade700,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Status Printer", style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
                            Text(tips, style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: _connected ? Colors.green.shade700 : Colors.red.shade700)),
                          ]
                        )
                      )
                    ]
                  )
                )
              ),
              const SizedBox(height: 24),
              
              Text("Pilih Perangkat", style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87)),
              const SizedBox(height: 12),

              // Device List
              StreamBuilder<List<BluetoothDevice>>(
                stream: bluetoothPrint.scanResults,
                initialData: [],
                builder: (c, snapshot) {
                  if (snapshot.data == null || snapshot.data!.isEmpty) {
                    return Container(
                      padding: EdgeInsets.symmetric(vertical: 30),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade200)
                      ),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(TablerIcons.printer_off, size: 40, color: Colors.grey.shade400),
                            SizedBox(height: 12),
                            Text("Tidak ada printer ditemukan", style: GoogleFonts.poppins(color: Colors.grey.shade500)),
                          ],
                        ),
                      )
                    );
                  }
                  return ListView.separated(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: snapshot.data!.length,
                    separatorBuilder: (context, index) => SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final d = snapshot.data![index];
                      final isSelected = _device != null && _device!.address == d.address;
                      return Card(
                        elevation: isSelected ? 2 : 0,
                        margin: EdgeInsets.zero,
                        color: isSelected ? Colors.blue.shade50 : Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: isSelected ? Colors.blue.shade300 : Colors.grey.shade200, width: isSelected ? 1.5 : 1),
                        ),
                        child: ListTile(
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          leading: Container(
                            padding: EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.blue : Colors.grey.shade100,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(TablerIcons.printer, color: isSelected ? Colors.white : Colors.grey.shade600, size: 20),
                          ),
                          title: Text(d.name ?? 'Unknown Device', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: isSelected ? Colors.blue.shade900 : Colors.black87)),
                          subtitle: Text(d.address ?? '', style: GoogleFonts.poppins(fontSize: 12)),
                          trailing: isSelected ? Icon(Icons.check_circle, color: Colors.blue) : null,
                          onTap: () {
                            setState(() {
                              _device = d;
                            });
                          },
                        ),
                      );
                    }
                  );
                }
              ),
              const SizedBox(height: 24),
              
              // Action Buttons Row (Connect/Disconnect)
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: Icon(TablerIcons.link, size: 18),
                      label: Text("Hubungkan", style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _connected ? Colors.grey.shade300 : config.background_smooth_navy,
                        foregroundColor: _connected ? Colors.grey.shade600 : Colors.white,
                        elevation: _connected ? 0 : 2,
                        padding: EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                      ),
                      onPressed: _connected ? null : () async {
                        if (_device != null && _device!.address != null) {
                          setState(() { tips = 'MENGHUBUNGKAN...'; });
                          await bluetoothPrint.connect(_device!);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Pilih perangkat printer terlebih dahulu', style: GoogleFonts.poppins())));
                        }
                      }
                    )
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: Icon(TablerIcons.link_off, size: 18),
                      label: Text("Putus", style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _connected ? Colors.red.shade600 : Colors.grey.shade200,
                        foregroundColor: _connected ? Colors.white : Colors.grey.shade500,
                        elevation: _connected ? 2 : 0,
                        padding: EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                      ),
                      onPressed: _connected ? () async {
                        setState(() { tips = 'MEMUTUSKAN KONEKSI...'; });
                        await bluetoothPrint.disconnect();
                      } : null,
                    )
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              // Print Button
              ElevatedButton.icon(
                icon: Icon(TablerIcons.receipt, size: 20),
                label: Text("Cetak Struk", style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  elevation: _connected ? 4 : 0,
                  padding: EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                ),
                onPressed: _connected
                    ? () async {
                                          final beranda = Provider.of<Beranda_provider>(context, listen: false);
                                          print("tesss");
                                          Map<String, dynamic> config = Map();
                                          config['width'] = 100;
                                          config['height'] = 70;
                                          config['gap'] = 2;

                                          List<LineText> list = [];

                                          // HEADER
                                          String outletName = beranda.name ?? 'KONTER PULSA';
                                          String outletWa = beranda.nomor_whatsapp ?? '';
                                          
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: outletName.toUpperCase(),
                                              weight: 1,
                                              align: LineText.ALIGN_CENTER,
                                              fontZoom: 1,
                                              linefeed: 1));
                                          
                                          if (outletWa.isNotEmpty && outletWa != 'Tidak ada nomor whatsapp') {
                                              list.add(LineText(
                                                  type: LineText.TYPE_TEXT,
                                                  content: 'WA: $outletWa',
                                                  weight: 0,
                                                  align: LineText.ALIGN_CENTER,
                                                  fontZoom: 1,
                                                  linefeed: 1));
                                          }
                                          list.add(LineText(linefeed: 1));
                                          
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: 'STRUK BUKTI PEMBAYARAN',
                                              weight: 1,
                                              align: LineText.ALIGN_CENTER,
                                              fontZoom: 1,
                                              linefeed: 1));
                                          
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: '================================',
                                              weight: 0,
                                              align: LineText.ALIGN_CENTER,
                                              linefeed: 1));

                                          // TRANSAKSI UMUM
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('TANGGAL', detail.tanggal ?? '-'), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('WAKTU', detail.waktu ?? '-'), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('INVOICE', widget.kodeTrans), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('STATUS', (detail.status ?? '').toUpperCase()), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: '--------------------------------',
                                              weight: 0,
                                              align: LineText.ALIGN_CENTER,
                                              linefeed: 1));

                                          // PASCABAYAR
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: 'PRODUK  : ${detail.productName ?? '-'}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: 'ID PEL  : ${detail.nomorTujuan ?? '-'}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: 'NAMA    : ${detail.namaPelanggan ?? '-'}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          if (detail.tarif != null && detail.tarif!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: 'TARIF   : ${detail.tarif ?? '-'}/${detail.daya ?? '-'}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }
                                          if (detail.noref != null && detail.noref!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: 'REF     : ${detail.noref ?? '-'}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }
                                          if (detail.sn != null && detail.sn!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: 'SN      : ${detail.sn}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }
                                          if (detail.periode != null && detail.periode!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: 'PERIODE : ${detail.periode}', align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }

                                          list.add(LineText(type: LineText.TYPE_TEXT, content: '--------------------------------', align: LineText.ALIGN_CENTER, linefeed: 1));
                                          
                                          if (detail.price != null && detail.price!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('TAGIHAN', detail.price ?? '-'), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }
                                          if (detail.biayaAdmin != null && detail.biayaAdmin!.isNotEmpty) {
                                            list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('ADMIN', detail.biayaAdmin ?? '-'), align: LineText.ALIGN_LEFT, linefeed: 1));
                                          }
                                          
                                          list.add(LineText(type: LineText.TYPE_TEXT, content: formatRow('TOTAL', detail.total ?? detail.totalPrice ?? '-'), align: LineText.ALIGN_LEFT, weight: 1, linefeed: 1));

                                          // FOOTER
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: '================================',
                                              weight: 0,
                                              align: LineText.ALIGN_CENTER,
                                              linefeed: 1));
                                              
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: 'TERIMA KASIH',
                                              weight: 1,
                                              align: LineText.ALIGN_CENTER,
                                              fontZoom: 1,
                                              linefeed: 1));
                                          
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: 'Simpan struk ini sebagai',
                                              align: LineText.ALIGN_CENTER,
                                              linefeed: 1));
                                          list.add(LineText(
                                              type: LineText.TYPE_TEXT,
                                              content: 'bukti pembayaran yang sah.',
                                              align: LineText.ALIGN_CENTER,
                                              linefeed: 1));
                                              
                                          if (detail.message != null && detail.message!.isNotEmpty) {
                                              list.add(LineText(linefeed: 1));
                                              list.add(LineText(type: LineText.TYPE_TEXT, content: 'NOTE:', align: LineText.ALIGN_CENTER, linefeed: 1));
                                              list.add(LineText(type: LineText.TYPE_TEXT, content: detail.message, align: LineText.ALIGN_CENTER, linefeed: 1));
                                          }
                                          
                                          list.add(LineText(linefeed: 3));

                                      await bluetoothPrint.printLabel(
                                          config, list);
                    }
                  : null,
              ),
              const SizedBox(height: 20),
            ],
                                    ),
                                  ),
                                ),
                              ),
                              const Spacer(),
                              const SizedBox(height: 80), // Extra space for FloatingActionButton
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: StreamBuilder<bool>(
        stream: bluetoothPrint.isScanning,
        initialData: false,
        builder: (c, snapshot) {
          if (snapshot.data == true) {
            return FloatingActionButton.extended(
              icon: Icon(Icons.stop),
              label: Text("Stop Cari", style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              onPressed: () => bluetoothPrint.stopScan(),
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            );
          } else {
            return FloatingActionButton.extended(
              backgroundColor: config.background_smooth_navy,
              foregroundColor: Colors.white,
              icon: Icon(TablerIcons.search),
              label: Text("Cari Printer", style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              onPressed: () => bluetoothPrint.startScan(timeout: Duration(seconds: 4)),
            );
          }
        },
      ),
    );
  }
}

class _Circle extends StatelessWidget {
  final double size;
  final double opacity;

  const _Circle({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withOpacity(opacity),
      ),
    );
  }
}
