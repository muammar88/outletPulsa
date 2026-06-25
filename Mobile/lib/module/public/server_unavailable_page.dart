import 'package:flutter/material.dart';
import 'package:outletpulsa/core/constants/config.dart';

class ServerUnavailablePage extends StatelessWidget {
  final VoidCallback onRetry;

  const ServerUnavailablePage({Key? key, required this.onRetry}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final config = ConfigApp();
    return Scaffold(
      backgroundColor: config.background_light_color,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              
              // Animated-like soft circular icon container
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.cloud_off_rounded,
                    size: 80,
                    color: Colors.red.shade400,
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
              
              Text(
                "Koneksi Terputus",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: config.text_dark_color,
                  letterSpacing: 0.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 16),
              
              Text(
                "Aplikasi tidak dapat terhubung ke server.\nPastikan internet Anda stabil atau coba kembali beberapa saat lagi.",
                style: TextStyle(
                  fontSize: 15,
                  color: config.text_grey_color,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const Spacer(flex: 2),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: config.btn_primary_color,
                    foregroundColor: config.text_light_color,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    elevation: 4,
                    shadowColor: config.btn_primary_color.withOpacity(0.4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: onRetry,
                  child: const Text(
                    "Coba Lagi",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
