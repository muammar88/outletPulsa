import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { GetLogDto } from './dto/get-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll(@Query() query: GetLogDto) {
    return this.logService.findAll(query);
  }
}
