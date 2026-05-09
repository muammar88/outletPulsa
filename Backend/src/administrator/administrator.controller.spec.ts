import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';

describe('AdministratorController', () => {
  let controller: AdministratorController;
  let service: AdministratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministratorController],
      providers: [AdministratorService],
    }).compile();

    controller = module.get<AdministratorController>(AdministratorController);
    service = module.get<AdministratorService>(AdministratorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return "Hello from Administrator Service"', () => {
    expect(controller.getHello()).toBe('Hello from Administrator Service');
  });
});
