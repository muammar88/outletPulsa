import { PrismaClient } from '@prisma/client';

export default async function iakPrabayarSeed(prisma: PrismaClient) {
  const types = [
    { id: 1, type: 'pulsa' },
    { id: 2, type: 'data' },
    { id: 3, type: 'etoll' },
    { id: 4, type: 'voucher' },
    { id: 5, type: 'game' },
    { id: 6, type: 'pln' },
    { id: 7, type: 'international' }
  ];

  for (const t of types) {
    await prisma.iakPrabayarType.upsert({
      where: { id: t.id },
      update: { type: t.type },
      create: { id: t.id, type: t.type }
    });
  }

  const operators = [
    { id: 1, name: 'axis', typeId: 1 },
    { id: 2, name: 'indosat', typeId: 1 },
    { id: 3, name: 'smart', typeId: 1 },
    { id: 4, name: 'telkomsel', typeId: 1 },
    { id: 5, name: 'three', typeId: 1 },
    { id: 6, name: 'xixi_games', typeId: 1 },
    { id: 7, name: 'xl', typeId: 1 },
    { id: 8, name: 'axis_paket_internet', typeId: 2 },
    { id: 9, name: 'telkomsel', typeId: 2 },
    { id: 10, name: 'indosat_paket_internet', typeId: 2 },
    { id: 11, name: 'smartfren_paket_internet', typeId: 2 },
    { id: 12, name: 'tri_paket_internet', typeId: 2 },
    { id: 13, name: 'telkomsel_paket_internet', typeId: 2 },
    { id: 14, name: 'xl_paket_internet', typeId: 2 },
    { id: 15, name: 'dana', typeId: 3 },
    { id: 16, name: 'mandiri_e-toll', typeId: 3 },
    { id: 17, name: 'indomaret_card_e-money', typeId: 3 },
    { id: 18, name: 'gopay_e-money', typeId: 3 },
    { id: 19, name: 'linkaja', typeId: 3 },
    { id: 20, name: 'ovo', typeId: 3 },
    { id: 21, name: 'shopee_pay', typeId: 3 },
    { id: 22, name: 'tix_id', typeId: 3 },
    { id: 23, name: 'alfamart', typeId: 4 },
    { id: 24, name: 'carrefour', typeId: 4 },
    { id: 25, name: 'indomaret', typeId: 4 },
    { id: 26, name: 'map', typeId: 4 },
    { id: 27, name: 'tokopedia', typeId: 4 },
    { id: 28, name: 'traveloka', typeId: 4 },
    { id: 29, name: 'udemy', typeId: 4 },
    { id: 30, name: 'arena_of_valor', typeId: 5 },
    { id: 31, name: 'battlenet_sea', typeId: 5 },
    { id: 32, name: 'bleach_mobile_3d', typeId: 5 },
    { id: 33, name: 'call_of_duty_mobile', typeId: 5 },
    { id: 34, name: 'dragon_nest_m_-_sea', typeId: 5 },
    { id: 35, name: 'era_of_celestials', typeId: 5 },
    { id: 36, name: 'free_fire', typeId: 5 },
    { id: 37, name: 'garena', typeId: 5 },
    { id: 38, name: 'gemscool', typeId: 5 },
    { id: 39, name: 'genshin_impact', typeId: 5 },
    { id: 40, name: 'google_play_us_region', typeId: 5 },
    { id: 41, name: 'google_play_indonesia', typeId: 5 },
    { id: 42, name: 'itunes_us_region', typeId: 5 },
    { id: 43, name: 'lyto', typeId: 5 },
    { id: 44, name: 'joox', typeId: 5 },
    { id: 45, name: 'megaxus', typeId: 5 },
    { id: 46, name: 'mobile_legend', typeId: 5 },
    { id: 47, name: 'razer_pin', typeId: 5 },
    { id: 48, name: 'playstation', typeId: 5 },
    { id: 49, name: 'steam_sea', typeId: 5 },
    { id: 50, name: 'wave_game', typeId: 5 },
    { id: 51, name: 'league_of_legends_wild_rift', typeId: 5 },
    { id: 52, name: 'lifeafter', typeId: 5 },
    { id: 53, name: 'light_of_thel:_glory_of_cepheus', typeId: 5 },
    { id: 54, name: 'lords_mobile', typeId: 5 },
    { id: 55, name: 'marvel_super_war', typeId: 5 },
    { id: 56, name: 'minecraft', typeId: 5 },
    { id: 57, name: 'netflix', typeId: 5 },
    { id: 58, name: 'nintendo_eshop', typeId: 5 },
    { id: 59, name: 'point_blank', typeId: 5 },
    { id: 60, name: 'pubg_mobile', typeId: 5 },
    { id: 61, name: 'pubg_pc', typeId: 5 },
    { id: 62, name: 'ragnarok_m', typeId: 5 },
    { id: 63, name: 'skyegrid', typeId: 5 },
    { id: 64, name: 'speed_drifters', typeId: 5 },
    { id: 65, name: 'vidio', typeId: 5 },
    { id: 66, name: 'viu', typeId: 5 },
    { id: 67, name: 'wifi_id', typeId: 5 },
    { id: 68, name: 'pln', typeId: 6 },
    { id: 69, name: 'by.u', typeId: 1 }
  ];

  for (const op of operators) {
    await prisma.iakPrabayarOperator.upsert({
      where: { id: op.id },
      update: { name: op.name, typeId: op.typeId },
      create: { id: op.id, name: op.name, typeId: op.typeId }
    });
  }
}
