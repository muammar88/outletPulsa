import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { SemuaServerService } from './semua_server.service';
import { CreateSemuaServerDto } from './dto/create-semua-server.dto';
import { UpdateSemuaServerDto } from './dto/update-semua-server.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/semua-server')
export class SemuaServerController {
  constructor(private readonly semuaServerService: SemuaServerService) {}


  @Get()
  findAll(
    @Query('search') search: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('status') status: string,
  ) {
    return this.semuaServerService.findAll(
      search,
      limit ? parseInt(limit, 10) : 10,
      page ? parseInt(page, 10) : 1,
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.semuaServerService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSemuaServerDto: UpdateSemuaServerDto) {
    return this.semuaServerService.update(+id, updateSemuaServerDto);
  }


}
