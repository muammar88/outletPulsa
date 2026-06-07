import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../config/config.dart';
import '../../../provider/BerandaProvider.dart';
import '../../../provider/RiwayatDepositProvider.dart';
import '../../../provider/RiwayatPrabayarProvider.dart';
import '../../../provider/RiwayatPascabayarProvider.dart';
import '../../../widget/NotFound.dart';
import '../../../widget/ErrorStateWidget.dart';
import '../widget/beranda/transaksi/detail_deposit.dart';
import '../widget/beranda/transaksi/detail_transaksi.dart';
import '../widget/beranda/transaksi/detail_transaksi_pascabayar.dart';

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
                const Color(0xFF1F2AAA),
                const Color(0xFF3A47C5),
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
          Sub_riwayat_deposit(),
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
    Color textColor;
    IconData icon;

    if (s == 'gagal' || s == 'failed') {
      bg = const Color(0xFFFFEBEE);
      textColor = const Color(0xFFD32F2F);
      icon = Icons.cancel_rounded;
    } else if (s == 'proses' || s == 'pending') {
      bg = const Color(0xFFFFF8E1);
      textColor = const Color(0xFFF57F17);
      icon = Icons.hourglass_top_rounded;
    } else {
      bg = const Color(0xFFE8F5E9);
      textColor = const Color(0xFF2E7D32);
      icon = Icons.check_circle_rounded;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: textColor),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: GoogleFonts.poppins(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Sub Riwayat Deposit ─────────────────────────────────────────────────────

class Sub_riwayat_deposit extends StatefulWidget {
  Sub_riwayat_deposit({super.key});

  @override
  State<Sub_riwayat_deposit> createState() => _Sub_riwayat_depositState();
}

class _Sub_riwayat_depositState extends State<Sub_riwayat_deposit> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Riwayat_deposit_provider>(context).getRiwayatDeposit();
      await Provider.of<Beranda_provider>(context, listen: false)
          .get_data_beranda();
      loadData = true;
    }
    super.didChangeDependencies();
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
                setState(() { loadData = false; });
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
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(tanggal);
    final formattedSaldo = _formatCurrency(saldo);

    // Tentukan warna berdasarkan status
    final s = status.toLowerCase();
    Color statusColor;
    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFE53935);
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF9A825);
    } else {
      statusColor = const Color(0xFF43A047);
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_deposit(status: status, id: id)),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1F2AAA).withOpacity(0.06),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              // Garis aksen samping
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 5,
                  decoration: BoxDecoration(
                    color: statusColor,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        // Icon Deposit
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFF1F2AAA).withOpacity(0.15),
                                const Color(0xFF3A47C5).withOpacity(0.05),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.account_balance_wallet_rounded,
                            color: Color(0xFF1F2AAA),
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 14),
                        // Nominal & Kode
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                formattedSaldo,
                                style: GoogleFonts.outfit(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A1A2E),
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                kode,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF6B7280),
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Status Badge
                        _StatusBadge(status: status),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1, color: Color(0xFFF3F4F6)),
                    const SizedBox(height: 12),
                    // Tanggal Transaksi
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.access_time_rounded,
                              size: 14,
                              color: Color(0xFF9CA3AF),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              formattedDate,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: const Color(0xFF6B7280),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                        Icon(
                          Icons.chevron_right_rounded,
                          size: 18,
                          color: const Color(0xFF9CA3AF),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ],
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
    if (loadData == false) {
      await Provider.of<Riwayat_pascabayar_provider>(context)
          .getRiwayatPascabayar();
      loadData = true;
    }
    super.didChangeDependencies();
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
                setState(() { loadData = false; });
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
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(transaction_date);
    final formattedKomisi = _formatCurrency(komisi);

    final s = status.toLowerCase();
    Color statusColor;
    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFE53935);
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF9A825);
    } else {
      statusColor = const Color(0xFF1E88E5);
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) =>
                  Detail_transaksi_pascabayar(kodeTrans: kode_transaksi)),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1565C0).withOpacity(0.06),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 5,
                  decoration: BoxDecoration(color: statusColor),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFF1565C0).withOpacity(0.15),
                                const Color(0xFF1E88E5).withOpacity(0.05),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.receipt_long_rounded,
                            color: Color(0xFF1565C0),
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                nama_produk,
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A1A2E),
                                  letterSpacing: 0.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                nomor_tujuan,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF6B7280),
                                ),
                              ),
                            ],
                          ),
                        ),
                        _StatusBadge(status: status),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1, color: Color(0xFFF3F4F6)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.access_time_rounded,
                              size: 14,
                              color: Color(0xFF9CA3AF),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              formattedDate,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: const Color(0xFF6B7280),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Text(
                              'ID#$kode_transaksi',
                              style: GoogleFonts.poppins(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF1565C0),
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(
                              Icons.chevron_right_rounded,
                              size: 18,
                              color: Color(0xFF9CA3AF),
                            ),
                          ],
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
    if (loadData == false) {
      await Provider.of<Riwayat_prabayar_provider>(context)
          .getRiwayatPrabayar();
      loadData = true;
    }
    super.didChangeDependencies();
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
                setState(() { loadData = false; });
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
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = _formatDate(waktu);
    final formattedHarga = _formatCurrency(harga);

    final s = status.toLowerCase();
    Color statusColor;
    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFE53935);
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF9A825);
    } else {
      statusColor = config.background_color;
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) =>
                  Detail_transaksi(kodeTrans: kode_transaksi!)),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: config.background_color.withOpacity(0.06),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 5,
                  decoration: BoxDecoration(color: statusColor),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                config.background_color.withOpacity(0.15),
                                config.background_smooth_navy.withOpacity(0.05),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.phone_android_rounded,
                            color: config.background_color,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A1A2E),
                                  letterSpacing: 0.2,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                nomor_tujuan,
                                style: GoogleFonts.poppins(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF6B7280),
                                ),
                              ),
                            ],
                          ),
                        ),
                        _StatusBadge(status: status),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1, color: Color(0xFFF3F4F6)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.access_time_rounded,
                              size: 14,
                              color: Color(0xFF9CA3AF),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              formattedDate,
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: const Color(0xFF6B7280),
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Text(
                              formattedHarga,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: config.background_color,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(
                              Icons.chevron_right_rounded,
                              size: 18,
                              color: Color(0xFF9CA3AF),
                            ),
                          ],
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
    );
  }
}
