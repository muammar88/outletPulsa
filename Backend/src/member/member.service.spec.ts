import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return "Hello from Member Service"', () => {
    expect(service.getHello()).toBe('Hello from Member Service');
  });
});
