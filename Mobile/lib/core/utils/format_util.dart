class FormatUtil {
  /// Melakukan normalisasi nomor handphone/ID pelanggan.
  /// Aturan:
  /// - Menghapus seluruh spasi, strip (-), dan karakter non-numerik lainnya.
  /// - Jika nomor diawali dengan +62 atau 62, diubah menjadi 0.
  static String normalizePhoneNumber(String phone) {
    if (phone.isEmpty) return phone;

    // Hapus seluruh karakter non-numerik kecuali tanda '+' 
    String cleaned = phone.replaceAll(RegExp(r'[^0-9+]'), '');

    // Jika diawali dengan +62, ubah jadi 0
    if (cleaned.startsWith('+62')) {
      cleaned = '0${cleaned.substring(3)}';
    }
    // Jika diawali dengan 62, ubah jadi 0
    else if (cleaned.startsWith('62')) {
      cleaned = '0${cleaned.substring(2)}';
    }

    // Pastikan tidak ada karakter selain angka yang tersisa (misal tanda '+' di tengah)
    cleaned = cleaned.replaceAll(RegExp(r'[^0-9]'), '');

    return cleaned;
  }
}
