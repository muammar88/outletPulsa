import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PascabayarCatalogService } from '../../providers/pascabayar/pascabayar-catalog.service';
import { ConnectPascabayarProviderDto } from './dto/connect-pascabayar-provider.dto';
import { InternalProductsDto } from './dto/internal-products.dto';
import { ListKatalogPascabayarDto } from './dto/list-katalog-pascabayar.dto';
import { ProviderActionDto } from './dto/provider-action.dto';
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe';

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
  async listKatalog(@Query() query: ListKatalogPascabayarDto) {
    const data = await this.catalog.listDigiflazzPascabayarProducts(query);
    return { message: 'Success', error: null, data };
  }

  @Get('katalog-digiflazz/sellers')
  async listSellers() {
    const data = await this.catalog.listDigiflazzPascabayarSellers();
    return { message: 'Success', error: null, data };
  }

  @Get('katalog-digiflazz/kategori')
  async listKategori() {
    const data = await this.catalog.getDigiflazzPascabayarCategories();
    return { message: 'Success', error: null, data };
  }

  // ── Pemetaan produk internal <-> provider ────────────────────────────────

  @Get('internal-products')
  async internalProducts(@Query() query: InternalProductsDto) {
    const parsedCatalogId = query.catalogId ? Number(query.catalogId) : null;
    const data = await this.catalog.getInternalProductOptions(query.search, {
      provider: query.provider,
      connection: query.connection,
      catalogId: Number.isFinite(parsedCatalogId) && parsedCatalogId ? parsedCatalogId : null,
    });
    return { message: 'Success', error: null, data };
  }

  @Get('produk/:id/kandidat')
  async kandidat(@Param('id', ParsePositiveIntPipe) id: number) {
    const data = await this.catalog.listCandidates(id);
    return { message: 'Success', error: null, data };
  }

  @Get('produk/:id/perbandingan')
  async perbandingan(@Param('id', ParsePositiveIntPipe) id: number) {
    const data = await this.catalog.compareProviders(id);
    return { message: 'Success', error: null, data };
  }

  @Post('produk/:id/connect')
  async connect(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() body: ConnectPascabayarProviderDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.connectProvider(
      {
        produkPascabayarId: id,
        provider: body.provider,
        providerSku: body.providerSku,
        iakProductId: body.iakProductId ?? null,
        digiflazzProductId: body.digiflazzProductId ?? null,
      },
      adminId,
    );
    return { message: 'Pemetaan provider berhasil disimpan', error: null, data };
  }

  @Post('produk/:id/select')
  async select(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() body: ProviderActionDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.selectActiveProvider(id, body.provider, adminId);
    return {
      message: 'Provider aktif diperbarui. Berlaku untuk inquiry baru; inquiry yang sudah berjalan tetap memakai provider asal.',
      error: null,
      data,
    };
  }

  @Post('produk/:id/disconnect')
  async disconnect(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() body: ProviderActionDto,
    @Request() req: any,
  ) {
    const adminId = req.user?.id ?? 0;
    const data = await this.catalog.disconnectProvider(id, body.provider, adminId);
    return { message: 'Pemetaan provider dihapus', error: null, data };
  }
}
