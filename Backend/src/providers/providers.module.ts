import { Global, Module } from '@nestjs/common';
import { IakService } from './iak.service';
import { DigiflazzService } from './digiflazz.service';
import { TripayService } from './tripay.service';
import { PrismaService } from '../prisma.service';
import { DigiflazzPascabayarAdapter } from './pascabayar/digiflazz-pascabayar.adapter';
import { IakPascabayarAdapter } from './pascabayar/iak-pascabayar.adapter';
import { PascabayarRouterService } from './pascabayar/pascabayar-router.service';
import { PascabayarSelectionService } from './pascabayar/pascabayar-selection.service';
import { PascabayarCatalogService } from './pascabayar/pascabayar-catalog.service';
import { PascabayarFinalizerService } from './pascabayar/pascabayar-finalizer.service';
import { PascabayarRecoveryService } from './pascabayar/pascabayar-recovery.service';
import { PengumumanModule } from '../pengumuman/pengumuman.module';

@Global()
@Module({
  imports: [PengumumanModule],
  providers: [
    IakService,
    DigiflazzService,
    TripayService,
    PrismaService,
    DigiflazzPascabayarAdapter,
    IakPascabayarAdapter,
    PascabayarRouterService,
    PascabayarSelectionService,
    PascabayarCatalogService,
    PascabayarFinalizerService,
    PascabayarRecoveryService,
  ],
  exports: [
    IakService,
    DigiflazzService,
    TripayService,
    PrismaService,
    DigiflazzPascabayarAdapter,
    IakPascabayarAdapter,
    PascabayarRouterService,
    PascabayarSelectionService,
    PascabayarCatalogService,
    PascabayarFinalizerService,
    PascabayarRecoveryService,
  ],
})
export class ProvidersModule {}
