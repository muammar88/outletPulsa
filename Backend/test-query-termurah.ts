import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check produk yang punya koneksi ke Tripay dan IAK sekaligus
  const produks = await prisma.produk.findMany({
    include: {
      iakPrabayarProduks: true,
      tripayPrabayarProduks: true,
      digiflazzProducts: true,
    },
    where: {
      AND: [
        { iakPrabayarProduks: { some: {} } },
        { tripayPrabayarProduks: { some: {} } },
      ]
    },
    take: 5,
  });

  for (const p of produks) {
    const iakActive = p.iakPrabayarProduks.filter(i => i.status === 'active' && i.price !== null);
    const tripayActive = p.tripayPrabayarProduks.filter(t => t.status?.toLowerCase() === 'active' && t.price !== null);
    const digiActive = p.digiflazzProducts.filter(d => d.status === 'active' && d.selectedSellerPrice !== null);

    console.log(`\nProduk: ${p.name} (ID: ${p.id})`);
    console.log('  IAK active:', iakActive.map(i => ({ price: i.price, status: i.status })));
    console.log('  Tripay active:', tripayActive.map(t => ({ price: t.price, status: t.status })));
    console.log('  Digi active:', digiActive.map(d => ({ price: d.selectedSellerPrice, status: d.status })));

    let cheapestPrice = Infinity;
    let selectedServerId: number | null = null;

    if (iakActive.length > 0) {
      const cheapestIak = Math.min(...iakActive.map(i => i.price!));
      if (cheapestIak < cheapestPrice) { cheapestPrice = cheapestIak; selectedServerId = 1; }
    }
    if (tripayActive.length > 0) {
      const cheapestTripay = Math.min(...tripayActive.map(t => t.price!));
      if (cheapestTripay < cheapestPrice) { cheapestPrice = cheapestTripay; selectedServerId = 2; }
    }
    if (digiActive.length > 0) {
      const cheapestDigi = Math.min(...digiActive.map(d => d.selectedSellerPrice!));
      if (cheapestDigi < cheapestPrice) { cheapestPrice = cheapestDigi; selectedServerId = 3; }
    }

    console.log(`  => PILIHAN: Server ${selectedServerId}, Harga: ${cheapestPrice}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
