import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { GetOperatorDto } from './dto/get-operator.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/operator')
@UseGuards(JwtAuthGuard)
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get()
  async findAll(@Query() query: GetOperatorDto) {
    const data = await this.operatorService.findAll(query);
    return { message: 'Success', error: null, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.operatorService.findOne(+id);
    return { message: 'Success', error: null, data };
  }

  @Post()
  async create(@Body() createOperatorDto: CreateOperatorDto) {
    const data = await this.operatorService.create(createOperatorDto);
    return { message: 'Operator berhasil ditambahkan', error: null, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOperatorDto: UpdateOperatorDto) {
    const data = await this.operatorService.update(+id, updateOperatorDto);
    return { message: 'Data operator berhasil diperbarui', error: null, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.operatorService.remove(+id);
    return { message: 'Operator berhasil dihapus', error: null, data: null };
  }
}
