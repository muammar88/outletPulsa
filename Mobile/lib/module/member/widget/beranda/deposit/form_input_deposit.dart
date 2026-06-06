import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:currency_text_input_formatter/currency_text_input_formatter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/AuthenticationProvider.dart';
import 'package:outletpulsa/provider/InfoAddDepositProvider.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../provider/BerandaProvider.dart';
import '../../../../../provider/DepositProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
import 'konfirmasi_deposit_saldo.dart';

class Form_input_deposit extends StatefulWidget {
  const Form_input_deposit({super.key});

  @override
  State<Form_input_deposit> createState() => _Form_input_depositState();
}

class _Form_input_depositState extends State<Form_input_deposit> {
  final config = ConfigApp();
  final List<String> defaultBank = ['0:Bank Belum Didefinisi'];
  bool loadData = false;
  String? selectedBank;
  var nominalController = TextEditingController();

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    final auth = Provider.of<Authentication_provider>(context, listen: false);
    if (auth.isLogin == true && !loadData) {
      final info = Provider.of<Info_add_deposit_provider>(context, listen: false);
      info.get_info_add_deposit();
      loadData = true;
    }
  }

  @override
  void dispose() {
    nominalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final listInfoDeposit = Provider.of<Info_add_deposit_provider>(context);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(TablerIcons.arrow_left, color: Colors.white),
        ),
        centerTitle: true,
        title: Text(
          'Tambah Saldo Deposit',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: Consumer<Load_provider>(
        builder: (context, loader, child) => Stack(
          children: [
            ListView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              children: [
                // Info Banner
                if (listInfoDeposit.pesan != null && listInfoDeposit.pesan!.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF90CAF9).withOpacity(0.5)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(TablerIcons.info_circle, color: Color(0xFF1976D2), size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Catatan Deposit',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1976D2),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                listInfoDeposit.pesan!,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  color: const Color(0xFF1A1A2E).withOpacity(0.8),
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                // Main Form Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Nominal Input
                      Row(
                        children: [
                          Icon(TablerIcons.cash, color: const Color(0xFF1A1A2E).withOpacity(0.6), size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Nominal Deposit',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1A1A2E),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      TextFormField(
                        controller: nominalController,
                        keyboardType: TextInputType.number,
                        enableSuggestions: false,
                        autocorrect: false,
                        inputFormatters: [
                          CurrencyTextInputFormatter.currency(
                            locale: 'id',
                            decimalDigits: 0,
                            symbol: 'Rp ',
                          )
                        ],
                        style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A2E),
                        ),
                        decoration: InputDecoration(
                          hintText: "Contoh: Rp 50.000",
                          hintStyle: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Colors.grey[400],
                            fontWeight: FontWeight.w400,
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF8F9FA),
                          contentPadding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 16.0),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFF1F2AAA), width: 1.5),
                          ),
                          prefixIcon: Icon(TablerIcons.wallet, color: Colors.grey[400], size: 20),
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Bank Dropdown
                      Row(
                        children: [
                          Icon(TablerIcons.building_bank, color: const Color(0xFF1A1A2E).withOpacity(0.6), size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Bank Tujuan Transfer',
                            style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1A1A2E),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      DropdownButtonFormField2<String>(
                        isExpanded: true,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color(0xFFF8F9FA),
                          contentPadding: const EdgeInsets.symmetric(vertical: 16.0),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Color(0xFF1F2AAA), width: 1.5),
                          ),
                        ),
                        hint: Text(
                          'Pilih Bank Tujuan Transfer',
                          style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Colors.grey[400],
                          ),
                        ),
                        iconStyleData: IconStyleData(
                          icon: Icon(TablerIcons.chevron_down, color: Colors.grey[500]),
                          iconSize: 20,
                        ),
                        dropdownStyleData: DropdownStyleData(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: Colors.white,
                          ),
                          elevation: 4,
                        ),
                        items: (listInfoDeposit.list_select_bank ?? defaultBank)
                            .map((item) => DropdownMenuItem<String>(
                                  value: item.split(':')[0],
                                  child: Text(
                                    'Bank ${item.split(':')[1]}',
                                    style: GoogleFonts.poppins(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: const Color(0xFF1A1A2E),
                                    ),
                                  ),
                                ))
                            .toList(),
                        value: selectedBank,
                        onChanged: (value) {
                          setState(() {
                            selectedBank = value;
                          });
                        },
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Submit Button
                      GestureDetector(
                        onTap: () => _submitForm(loader),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF1F2AAA).withOpacity(0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(TablerIcons.receipt, size: 20, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                "Ambil Tiket Deposit",
                                style: GoogleFonts.poppins(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (loader.isLoad == true) const CircularProgressWidget() else const SizedBox(),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm(Load_provider loader) async {
    var err = false;
    var errMsg = '';

    if (nominalController.text.isEmpty) {
      errMsg += 'Nominal Tidak Boleh Kosong.\n';
      err = true;
    }
    if (selectedBank == null || selectedBank == '0') {
      errMsg += 'Anda Wajib Memilih Salah Satu Bank Tujuan Transfer.';
      err = true;
    }

    if (!err) {
      loader.isLoad = true;
      final deposit = Provider.of<Deposit_provider>(context, listen: false);
      
      var feedBack = await deposit.depositSaldo(nominalController.text, selectedBank!);
      
      loader.isLoad = false;
      
      if (feedBack.error == false) {
        await Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();

        _showSnackBar(feedBack.errorMsg ?? 'Berhasil ambil tiket', isSuccess: true);
        
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const Konfirmasi_deposit_saldo()),
        );
      } else {
        _showSnackBar(feedBack.errorMsg ?? 'Gagal mengambil tiket deposit', isSuccess: false);
      }
    } else {
      _showSnackBar(errMsg, isSuccess: false);
    }
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        content: Text(
          message,
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
