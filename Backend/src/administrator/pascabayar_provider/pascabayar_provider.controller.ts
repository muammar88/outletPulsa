import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PascabayarCatalogService } from '../../providers/pascabayar/pascabayar-catalog.service';

/**
 * Panel admin untuk katalog pascabayar Digiflazz, pemetaan SKU, perbandingan
 * biaya, dan pemilihan provider aktif per produk internal.
 */
@Controller('administrator/pascabayar-provider')
@UseGuards(JwtAuthGuard)
export class PascabayarProviderController {
  constructor(private readonly catalog: PascabayarCatalogService) {}

  // ── Katalog Digiflazz pascabayar ─────────────────────────────────────────

  @Post('katalog-digiflazz/sync')
  async syncKatalog(@Request() req: any) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.syncDigiflazzPascabayar(adminId);
    return { message: 'Sinkronisasi katalog pascabayar Digiflazz selesai', error: null, data };
  }

  @Get('katalog-digiflazz')
  async listKatalog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('connected') connected?: string,
  ) {
    const data = await this.catalog.listDigiflazzPascabayarProducts({ page, limit, search, category, connected });
    return { message: 'Success', error: null, data };
  }

  @Get('katalog-digiflazz/kategori')
  async listKategori() {
    const data = await this.catalog.getDigiflazzPascabayarCategories();
    return { message: 'Success', error: null, data };
  }

  // ── Pemetaan produk internal <-> provider ────────────────────────────────

  @Get('internal-products')
  async internalProducts(@Query('search') search?: string) {
    const data = await this.catalog.getInternalProductOptions(search);
    return { message: 'Success', error: null, data };
  }

  @Get('produk/:id/kandidat')
  async kandidat(@Param('id') id: string) {
    const data = await this.catalog.listCandidates(Number(id));
    return { message: 'Success', error: null, data };
  }

  @Get('produk/:id/perbandingan')
  async perbandingan(@Param('id') id: string) {
    const data = await this.catalog.compareProviders(Number(id));
    return { message: 'Success', error: null, data };
  }

  @Post('produk/:id/connect')
  async connect(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.connectProvider(
      {
        produkPascabayarId: Number(id),
        provider: body.provider,
        providerSku: body.providerSku ?? body.provider_sku,
        iakProductId: body.iakProductId ?? body.iak_product_id ?? null,
        digiflazzProductId: body.digiflazzProductId ?? body.digiflazz_product_id ?? null,
      },
      adminId,
    );
    return { message: 'Pemetaan provider berhasil disimpan', error: null, data };
  }

  @Post('produk/:id/select')
  async select(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.selectActiveProvider(Number(id), body.provider, adminId);
    return {
      message: 'Provider aktif diperbarui. Berlaku untuk inquiry baru; inquiry yang sudah berjalan tetap memakai provider asal.',
      error: null,
      data,
    };
  }

  @Post('produk/:id/disconnect')
  async disconnect(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.disconnectProvider(Number(id), body.provider, adminId);
    return { message: 'Pemetaan provider dihapus', error: null, data };
  }
}
