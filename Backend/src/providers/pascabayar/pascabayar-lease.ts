import { PrismaService } from '../../prisma.service';

/** Jeda minimal antar pemeriksaan status provider untuk transaksi yang sama. */
export const PASCA_MIN_JEDA_MS = 60_000;

/**
 * Klaim atomik untuk satu siklus pemeriksaan status (worker pemulihan maupun
 * tombol cek status).
 *
 * Klaim dilakukan dengan satu UPDATE bersyarat (`status = proses` dan
 * `updatedAt <= cutoff`). Di level database hanya satu pemanggil yang menang
 * untuk rentang jeda tersebut; pemanggil kedua mendapat false dan harus
 * memakai status lokal, bukan memanggil provider secara bersamaan.
 */
export async function claimStatusCheck(
  prisma: PrismaService,
  id: number,
  now: Date = new Date(),
): Promise<boolean> {
  const cutoff = new Date(now.getTime() - PASCA_MIN_JEDA_MS);
  const claimed = await prisma.transactionPascabayar.updateMany({
    where: { id, status: 'proses', updatedAt: { lte: cutoff } },
    data: { updatedAt: now },
  });
  return claimed.count === 1;
}
