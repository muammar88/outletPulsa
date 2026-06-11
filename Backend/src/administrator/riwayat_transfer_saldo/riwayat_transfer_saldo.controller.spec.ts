import { Test, TestingModule } from '@nestjs/testing';
import { RiwayatTransferSaldoController } from './riwayat_transfer_saldo.controller';

describe('RiwayatTransferSaldoController', () => {
  let controller: RiwayatTransferSaldoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiwayatTransferSaldoController],
    }).compile();

    controller = module.get<RiwayatTransferSaldoController>(RiwayatTransferSaldoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
