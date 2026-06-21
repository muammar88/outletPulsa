import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';

class LoadingOverlay {
  /// Menampilkan dialog loading
  static void show(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.white,
      builder: (BuildContext context) {
        return const _LoadingDialogContent();
      },
    );
  }

  /// Menutup dialog loading
  static void hide(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }
}

class _LoadingDialogContent extends StatelessWidget {
  const _LoadingDialogContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 110,
        height: 110,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        // Lingkaran Berputar (Animasi bergaya iOS / Cupertino)
        child: const CupertinoActivityIndicator(
          radius: 40,
          color: Color(0xFF0F1F6E), // Warna Navy khas OutletPulsa
        ),
      ),
    );
  }
}
