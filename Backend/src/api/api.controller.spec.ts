import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

describe('ApiController', () => {
  let controller: ApiController;
  let service: ApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [ApiService],
    }).compile();

    controller = module.get<ApiController>(ApiController);
    service = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return "Hello from API Service"', () => {
    expect(controller.getHello()).toBe('Hello from API Service');
  });
});
