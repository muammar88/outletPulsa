import { Controller, Get } from '@nestjs/common';
import { AdministratorService } from './administrator.service';

@Controller('administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  getHello(): string {
    return this.administratorService.getHello();
  }
}
