import { Test, TestingModule } from '@nestjs/testing';
import { RiwayatTransferSaldoService } from './riwayat_transfer_saldo.service';

describe('RiwayatTransferSaldoService', () => {
  let service: RiwayatTransferSaldoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiwayatTransferSaldoService],
    }).compile();

    service = module.get<RiwayatTransferSaldoService>(RiwayatTransferSaldoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
