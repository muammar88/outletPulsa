import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/RiwayatDepositProvider.dart';
import 'package:outletpulsa/shared/providers/RiwayatPrabayarProvider.dart';
import 'package:outletpulsa/shared/providers/RiwayatPascabayarProvider.dart';
import 'package:outletpulsa/shared/widgets/NotFound.dart';
import 'package:outletpulsa/shared/widgets/ErrorStateWidget.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_deposit.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_transaksi.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/detail_transaksi_pascabayar.dart';

class Riwayat_tab extends StatefulWidget {
  const Riwayat_tab({super.key});

  @override
  State<Riwayat_tab> createState() => _Riwayat_tabState();
}

class _Riwayat_tabState extends State<Riwayat_tab>
    with SingleTickerProviderStateMixin {
  final config = ConfigApp();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: config.background_smooth_navy,
        elevation: 0,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFF0F1F6E),
                const Color(0xFF1A3DB5),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: Text(
          'Riwayat Transaksi',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(46),
          child: Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            height: 38,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: config.background_smooth_navy,
              unselectedLabelColor: Colors.white.withOpacity(0.85),
              labelStyle: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w400,
              ),
              tabs: const [
                Tab(text: 'Prabayar'),
                Tab(text: 'Pascabayar'),
                Tab(text: 'Deposit'),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          Sub_riwayat_prabayar(),
          Sub_riwayat_pascabayar(),
          Sub_riwayat_deposit(tabController: _tabController),
        ],
      ),
    );
  }
}

// ─── Status Badge ────────────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final s = status.toLowerCase();
    Color bg;
    Color borderColor;
    Color textColor;

    if (s == 'gagal' || s == 'failed') {
      bg = Colors.red.withOpacity(0.1);
      borderColor = Colors.red.withOpacity(0.4);
      textColor = Colors.red[700]!;
    } else if (s == 'proses' || s == 'pending') {
      bg = Colors.orange.withOpacity(0.1);
      borderColor = Colors.orange.withOpacity(0.4);
      textColor = Colors.orange[800]!;
    } else {
      bg = Colors.green.withOpacity(0.1);
      borderColor = Colors.green.withOpacity(0.4);
      textColor = Colors.green[700]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Text(
        status.toUpperCase(),
        style: GoogleFonts.poppins(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}

// ─── Sub Riwayat Deposit ─────────────────────────────────────────────────────

class Sub_riwayat_deposit extends StatefulWidget {
  final TabController? tabController;
  Sub_riwayat_deposit({super.key, this.tabController});

  @override
  State<Sub_riwayat_deposit> createState() => _Sub_riwayat_depositState();
}

class _Sub_riwayat_depositState extends State<Sub_riwayat_deposit>
    with WidgetsBindingObserver {
  final config = ConfigApp();
  bool loadData = false;

  Timer? _timer;
  bool _isFetching = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.tabController != null) {
      widget.tabController!.addListener(_handleTabSelection);
    }
  }

  void _handleTabSelection() {
    if (widget.tabController?.index == 2) {
      _startPolling();
    } else {
      _stopPolling();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      if (widget.tabController == null || widget.tabController!.index == 2) {
        _startPolling();
      }
    } else {
      _stopPolling();
    }
  }

  void _startPolling() {
    if (_timer != null && _timer!.isActive) return;
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _fetchData();
    });
  }

  void _stopPolling() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> _fetchData() async {
    if (_isFetching || !mounted) return;

    final isCurrentRoute = ModalRoute.of(context)?.isCurrent ?? true;
    if (!isCurrentRoute) return;

    _isFetching = true;
    try {
      final riwayat =
          Provider.of<Riwayat_deposit_provider>(context, listen: false);
      await riwayat.getRiwayatDeposit();
    } finally {
      if (mounted) {
        _isFetching = false;
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (loadData == false) {
      loadData = true;

      // Initial fetch
      final riwayat =
          Provider.of<Riwayat_deposit_provider>(context, listen: false);
      final beranda = Provider.of<Beranda_provider>(context, listen: false);
      riwayat.getRiwayatDeposit().then((_) {
        if (mounted) {
          beranda.get_data_beranda();
        }
      });

      if (widget.tabController == null || widget.tabController!.index == 2) {
        _startPolling();
      }
    }
  }

  @override
  void dispose() {
    _stopPolling();
    if (widget.tabController != null) {
      widget.tabController!.removeListener(_handleTabSelection);
    }
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_deposit_provider>(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: riwayat.list != null
            ? riwayat.list!.length == 0
                ? 1
                : riwayat.list!.length
            : 1,
        itemBuilder: (BuildContext context, int index) {
          if (riwayat.error == true) {
            return ErrorStateWidget(
              config: config,
              errorMessage: riwayat.errorMsg ?? "Terjadi kesalahan",
              onRetry: () {
                setState(() {
                  loadData = false;
                });
              },
            );
          }
          if (riwayat.list == null || riwayat.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Riwayat Deposit');
          }
          final item = riwayat.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxListDeposit(
                    config: config,
                    tanggal: item['waktuRequest']?.toString() ?? '',
                    saldo: item['nominal']?.toString() ?? '0',
                    status: item['status']?.toString() ?? '',
                    kode: 'DEP#${item['kode']}',
                    id: item['id']?.toString() ?? '',
                    index: index,
                  ),
                ])
              : BoxListDeposit(
                  config: config,
                  tanggal: item['waktuRequest']?.toString() ?? '',
                  saldo: item['nominal']?.toString() ?? '0',
                  status: item['status']?.toString() ?? '',
                  kode: 'DEP#${item['kode']}',
                  id: item['id']?.toString() ?? '',
                  index: index,
                );
        },
      ),
    );
  }
}

class BoxListDeposit extends StatelessWidget {
  const BoxListDeposit({
    super.key,
    required this.config,
    required this.tanggal,
    required this.saldo,
    required this.status,
    required this.kode,
    required this.id,
    required this.index,
  });

  final ConfigApp config;
  final String tanggal;
  final String saldo;
  final String status;
  final String id;
  final String kode;
  final index;

  String _formatDate(String rawDate) {
    try {
      DateTime dt = DateTime.parse(rawDate).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(dt);
    } catch (e) {
      return rawDate;
    }
  }

  String _formatCurrency(String amount) {
    try {
      double val = double.parse(amount);
      return NumberFormat.currency(
              locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)
          .format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(tanggal);
    final formattedSaldo = _formatCurrency(saldo);
    int staggerIndex = index > 15 ? 15 : index;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) =>
                        Detail_deposit(status: status, id: id)),
              );
            },
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.05),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    border: Border(
                      bottom: BorderSide(color: Colors.grey.shade100),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(
                              Icons.tag_rounded,
                              size: 16,
                              color: Color(0xFF0F1F6E),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                kode,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F1F6E),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'ID#$id',
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Body
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Leading Icon
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.account_balance_wallet_rounded,
                          color: Color(0xFF0F1F6E),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Content Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Deposit Saldo',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              formattedSaldo,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Trailing
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _StatusBadge(status: status),
                          const SizedBox(height: 6),
                          Text(
                            formattedDate,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Sub Riwayat Pascabayar ───────────────────────────────────────────────────

class Sub_riwayat_pascabayar extends StatefulWidget {
  Sub_riwayat_pascabayar({super.key});

  @override
  State<Sub_riwayat_pascabayar> createState() => _Sub_riwayat_pascabayarState();
}

class _Sub_riwayat_pascabayarState extends State<Sub_riwayat_pascabayar> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (loadData == false) {
      loadData = true;
      final riwayat =
          Provider.of<Riwayat_pascabayar_provider>(context, listen: false);
      await riwayat.getRiwayatPascabayar();
    }
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_pascabayar_provider>(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: riwayat.list != null
            ? riwayat.list!.length == 0
                ? 1
                : riwayat.list!.length
            : 1,
        itemBuilder: (BuildContext context, int index) {
          if (riwayat.error == true) {
            return ErrorStateWidget(
              config: config,
              errorMessage: riwayat.errorMsg ?? "Terjadi kesalahan",
              onRetry: () {
                setState(() {
                  loadData = false;
                });
              },
            );
          }
          if (riwayat.list == null || riwayat.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Riwayat Transaksi');
          }
          final item = riwayat.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxListRiwayatPascabayar(
                    config: config,
                    type: 'pascabayar',
                    kode_transaksi: item['kode_transaksi'],
                    nama_produk: item['nama_produk'],
                    nomor_tujuan: item['nomor_tujuan'],
                    komisi: item['komisi'],
                    status: item['status'],
                    transaction_date: item['transaction_date'],
                    index: index,
                  ),
                ])
              : BoxListRiwayatPascabayar(
                  config: config,
                  type: 'pascabayar',
                  kode_transaksi: item['kode_transaksi'],
                  nama_produk: item['nama_produk'],
                  nomor_tujuan: item['nomor_tujuan'],
                  komisi: item['komisi'],
                  status: item['status'],
                  transaction_date: item['transaction_date'],
                  index: index,
                );
        },
      ),
    );
  }
}

class BoxListRiwayatPascabayar extends StatelessWidget {
  const BoxListRiwayatPascabayar({
    super.key,
    required this.config,
    required this.type,
    required this.kode_transaksi,
    required this.nama_produk,
    required this.nomor_tujuan,
    required this.komisi,
    required this.status,
    required this.transaction_date,
    required this.index,
  });

  final ConfigApp config;
  final String type;
  final String kode_transaksi;
  final String nama_produk;
  final String nomor_tujuan;
  final String komisi;
  final String status;
  final String transaction_date;
  final index;

  String _formatDate(String rawDate) {
    try {
      DateTime dt = DateTime.parse(rawDate).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(dt);
    } catch (e) {
      return rawDate;
    }
  }

  String _formatCurrency(String amount) {
    try {
      double val = double.parse(amount);
      return NumberFormat.currency(
              locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)
          .format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(transaction_date);
    int staggerIndex = index > 15 ? 15 : index;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) =>
                        Detail_transaksi_pascabayar(kodeTrans: kode_transaksi)),
              );
            },
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.05),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    border: Border(
                      bottom: BorderSide(color: Colors.grey.shade100),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(
                              Icons.tag_rounded,
                              size: 16,
                              color: Color(0xFF0F1F6E),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'ID#$kode_transaksi',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F1F6E),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Body
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Leading Icon
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.receipt_long_rounded,
                          color: Color(0xFF0F1F6E),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Content Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              nama_produk,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              nomor_tujuan,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Trailing
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _StatusBadge(status: status),
                          const SizedBox(height: 6),
                          Text(
                            formattedDate,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Sub Riwayat Prabayar ─────────────────────────────────────────────────────

class Sub_riwayat_prabayar extends StatefulWidget {
  Sub_riwayat_prabayar({super.key});

  @override
  State<Sub_riwayat_prabayar> createState() => _Sub_riwayat_prabayarState();
}

class _Sub_riwayat_prabayarState extends State<Sub_riwayat_prabayar> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    super.didChangeDependencies();
    if (loadData == false) {
      loadData = true;
      final riwayat =
          Provider.of<Riwayat_prabayar_provider>(context, listen: false);
      await riwayat.getRiwayatPrabayar();
    }
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_prabayar_provider>(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        itemCount: riwayat.list != null
            ? riwayat.list!.length == 0
                ? 1
                : riwayat.list!.length
            : 1,
        itemBuilder: (BuildContext context, int index) {
          if (riwayat.error == true) {
            return ErrorStateWidget(
              config: config,
              errorMessage: riwayat.errorMsg ?? "Terjadi kesalahan",
              onRetry: () {
                setState(() {
                  loadData = false;
                });
              },
            );
          }
          if (riwayat.list == null || riwayat.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Riwayat Transaksi');
          }
          final item = riwayat.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxListRiwayat(
                    config: config,
                    type: 'prabayar',
                    waktu: item['transaction_date'],
                    name: item['name_produk'],
                    nomor_tujuan: item['nomor_tujuan'],
                    kode_transaksi: item['kode_transaksi'],
                    harga: item['selling_price'],
                    fee_agen: item['fee_agen'],
                    selling_price_raw: item['selling_price_raw'],
                    status: item['status'],
                    index: index,
                  ),
                ])
              : BoxListRiwayat(
                  config: config,
                  type: 'prabayar',
                  waktu: item['transaction_date'],
                  name: item['name_produk'],
                  nomor_tujuan: item['nomor_tujuan'],
                  kode_transaksi: item['kode_transaksi'],
                  harga: item['selling_price'],
                  fee_agen: item['fee_agen'],
                  selling_price_raw: item['selling_price_raw'],
                  status: item['status'],
                  index: index,
                );
        },
      ),
    );
  }
}

class BoxListRiwayat extends StatelessWidget {
  const BoxListRiwayat({
    super.key,
    required this.config,
    required this.type,
    required this.waktu,
    required this.name,
    required this.nomor_tujuan,
    required this.kode_transaksi,
    required this.harga,
    required this.fee_agen,
    required this.selling_price_raw,
    required this.status,
    required this.index,
  });

  final ConfigApp config;
  final String type;
  final String waktu;
  final String name;
  final String nomor_tujuan;
  final String? kode_transaksi;
  final String harga;
  final dynamic fee_agen;
  final dynamic selling_price_raw;
  final String status;
  final index;

  String _formatDate(String rawDate) {
    try {
      DateTime dt = DateTime.parse(rawDate).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(dt);
    } catch (e) {
      return rawDate;
    }
  }

  String _formatCurrency(String amount) {
    try {
      double val = double.parse(amount);
      return NumberFormat.currency(
              locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)
          .format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(waktu);

    final beranda = Provider.of<Beranda_provider>(context, listen: false);
    final isReseller = !beranda.isAgen;

    String displayPriceStr = harga;
    if (isReseller && fee_agen != null && selling_price_raw != null) {
      try {
        int basePrice = selling_price_raw is int ? selling_price_raw : int.parse(selling_price_raw.toString());
        int fee = fee_agen is int ? fee_agen : int.parse(fee_agen.toString());
        displayPriceStr = _formatCurrency((basePrice + fee).toString());
      } catch (e) {
        // ignore
      }
    } else {
      displayPriceStr = _formatCurrency(harga.replaceAll(RegExp(r'[^0-9]'), ''));
    }

    final formattedHarga = displayPriceStr;
    int staggerIndex = index > 15 ? 15 : index;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) =>
                        Detail_transaksi(kodeTrans: kode_transaksi!)),
              );
            },
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1F6E).withOpacity(0.05),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    border: Border(
                      bottom: BorderSide(color: Colors.grey.shade100),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(
                              Icons.tag_rounded,
                              size: 16,
                              color: Color(0xFF0F1F6E),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'ID#${kode_transaksi ?? "-"}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF0F1F6E),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Body
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Leading Icon
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Icon(
                          Icons.phone_android_rounded,
                          color: Color(0xFF0F1F6E),
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Content Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              formattedHarga,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                            Text(
                              nomor_tujuan,
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Trailing
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _StatusBadge(status: status),
                          const SizedBox(height: 6),
                          Text(
                            formattedDate,
                            style: GoogleFonts.poppins(
                              fontSize: 10,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
