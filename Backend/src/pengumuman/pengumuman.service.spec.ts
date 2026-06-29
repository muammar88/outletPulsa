import { Test, TestingModule } from '@nestjs/testing';
import { PengumumanService } from './pengumuman.service';

describe('PengumumanService', () => {
  let service: PengumumanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PengumumanService],
    }).compile();

    service = module.get<PengumumanService>(PengumumanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
