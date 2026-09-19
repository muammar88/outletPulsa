import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/shared/providers/DepositProvider.dart';
import 'package:outletpulsa/shared/widgets/CircularProgressWidget.dart';
import 'payment_instruction_screen.dart';

class PaymentMethodScreen extends StatefulWidget {
  final int nominal;

  const PaymentMethodScreen({super.key, required this.nominal});

  @override
  State<PaymentMethodScreen> createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends State<PaymentMethodScreen> {
  static const Color _kPrimary = Color(0xFF0F1F6E);
  bool _isLoading = true;
  List<dynamic> _methods = [];

  @override
  void initState() {
    super.initState();
    _fetchMethods();
  }

  Future<void> _fetchMethods() async {
    final deposit = Provider.of<Deposit_provider>(context, listen: false);
    final response = await deposit.getLinkquPaymentMethods();
    
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (response.error == false) {
          _methods = response.data?['items'] ?? [];
        } else {
          _showSnackBar(response.errorMsg ?? 'Gagal memuat metode pembayaran');
        }
      });
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  String _formatCurrency(int amount) {
    final formatter = NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(amount);
  }

  void _onMethodSelected(dynamic method) {
    if (method['code'] == 'QRIS') {
      _processDeposit(method['code'], null);
    } else {
      _showSubMethods(method);
    }
  }

  void _showSubMethods(dynamic method) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final items = method['items'] as List<dynamic>;
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Pilih ${method['name']}',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _kPrimary,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return ListTile(
                      leading: item['image'] != null
                          ? Image.network(item['image'], width: 40, height: 40, errorBuilder: (c,e,s) => const Icon(TablerIcons.building_bank))
                          : const Icon(TablerIcons.building_bank, color: _kPrimary),
                      title: Text(item['name']),
                      onTap: () {
                        Navigator.pop(context);
                        _processDeposit(method['code'], item['kode']);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _processDeposit(String paymentMethod, String? bankCode) async {
    setState(() => _isLoading = true);
    
    final deposit = Provider.of<Deposit_provider>(context, listen: false);
    final response = await deposit.processLinkquDeposit(
      nominal: widget.nominal,
      paymentMethod: paymentMethod,
      bankCode: bankCode,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (response.error == false && response.data != null) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => PaymentInstructionScreen(transactionData: response.data!)),
        );
      } else {
        _showSnackBar(response.errorMsg ?? 'Gagal membuat transaksi');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        backgroundColor: _kPrimary,
        elevation: 0,
        title: Text('Pilih Metode Pembayaran', style: GoogleFonts.poppins(fontSize: 18)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Text('Total Deposit', style: GoogleFonts.poppins(color: Colors.grey)),
                        const SizedBox(height: 8),
                        Text(
                          _formatCurrency(widget.nominal),
                          style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.bold, color: _kPrimary),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _methods.length,
                      itemBuilder: (context, index) {
                        final method = _methods[index];
                        return Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: _kPrimary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                method['code'] == 'VA' ? TablerIcons.building_bank
                                : method['code'] == 'EWALLET' ? TablerIcons.wallet
                                : TablerIcons.qrcode,
                                color: _kPrimary,
                              ),
                            ),
                            title: Text(method['name'], style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                            trailing: const Icon(TablerIcons.chevron_right),
                            onTap: () => _onMethodSelected(method),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
