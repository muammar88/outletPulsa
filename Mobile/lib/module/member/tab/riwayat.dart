import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../config/config.dart';
import '../../../provider/BerandaProvider.dart';
import '../../../provider/RiwayatDepositProvider.dart';
import '../../../provider/RiwayatPrabayarProvider.dart';
import '../../../provider/RiwayatPascabayarProvider.dart';
import '../../../widget/NotFound.dart';
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
          if (riwayat.list == null || riwayat.list!.length == 0) {
            return NotfoundWidget(config: config, label: 'Riwayat Deposit');
          }
          final item = riwayat.list![index.toString()];
          return index == 0
              ? Column(children: [
                  const SizedBox(height: 16),
                  BoxListDeposit(
                    config: config,
                    tanggal: item['waktuRequest'],
                    saldo: item['nominal'],
                    status: item['status'],
                    kode: 'DEP#${item['kode']}',
                    id: item['id'],
                    index: index,
                  ),
                ])
              : BoxListDeposit(
                  config: config,
                  tanggal: item['waktuRequest'],
                  saldo: item['nominal'],
                  status: item['status'],
                  kode: 'DEP#${item['kode']}',
                  id: item['id'],
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

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_deposit(status: status, id: id)),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top accent line
            Container(
              height: 4,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: status.toLowerCase() == 'gagal'
                      ? [const Color(0xFFD32F2F), const Color(0xFFEF5350)]
                      : status.toLowerCase() == 'proses'
                          ? [const Color(0xFFF57F17), const Color(0xFFFFB300)]
                          : [const Color(0xFF2E7D32), const Color(0xFF43A047)],
                ),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Row(
                children: [
                  // Icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F2AAA).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.account_balance_wallet_rounded,
                      color: config.background_smooth_navy,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          saldo,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          tanggal,
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Right side
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        kode,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: config.background_smooth_navy,
                        ),
                      ),
                      const SizedBox(height: 6),
                      _StatusBadge(status: status),
                    ],
                  ),
                ],
              ),
            ),
          ],
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

  @override
  Widget build(BuildContext context) {
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
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              height: 4,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: status.toLowerCase() == 'gagal'
                      ? [const Color(0xFFD32F2F), const Color(0xFFEF5350)]
                      : status.toLowerCase() == 'proses'
                          ? [const Color(0xFFF57F17), const Color(0xFFFFB300)]
                          : [const Color(0xFF1565C0), const Color(0xFF1E88E5)],
                ),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1565C0).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      color: Color(0xFF1565C0),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          nama_produk,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          nomor_tujuan,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          transaction_date,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'ID#$kode_transaksi',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1565C0),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        komisi,
                        style: GoogleFonts.poppins(
                          fontSize: 11,
                          color: Colors.grey[500],
                        ),
                      ),
                      const SizedBox(height: 6),
                      _StatusBadge(status: status),
                    ],
                  ),
                ],
              ),
            ),
          ],
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

  @override
  Widget build(BuildContext context) {
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
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              height: 4,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: status.toLowerCase() == 'gagal'
                      ? [const Color(0xFFD32F2F), const Color(0xFFEF5350)]
                      : status.toLowerCase() == 'proses'
                          ? [const Color(0xFFF57F17), const Color(0xFFFFB300)]
                          : [const Color(0xFF00796B), const Color(0xFF26A69A)],
                ),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00796B).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.phone_android_rounded,
                      color: Color(0xFF00796B),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1A1A2E),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          nomor_tujuan,
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          waktu,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: Colors.grey[400],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'ID#${kode_transaksi ?? '-'}',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF00796B),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        harga,
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A2E),
                        ),
                      ),
                      const SizedBox(height: 6),
                      _StatusBadge(status: status),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
