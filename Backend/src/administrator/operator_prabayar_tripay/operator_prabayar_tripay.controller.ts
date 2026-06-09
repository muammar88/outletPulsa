import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OperatorPrabayarTripayService } from './operator_prabayar_tripay.service';
import { GetOperatorPrabayarTripayDto } from './dto/get-operator-prabayar-tripay.dto';
import { CreateOperatorPrabayarTripayDto } from './dto/create-operator-prabayar-tripay.dto';
import { UpdateOperatorPrabayarTripayDto } from './dto/update-operator-prabayar-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/operator-prabayar-tripay')
@UseGuards(JwtAuthGuard)
export class OperatorPrabayarTripayController {
  constructor(private readonly operatorPrabayarTripayService: OperatorPrabayarTripayService) {}

  @Get()
  async findAll(@Query() query: GetOperatorPrabayarTripayDto) {
    const data = await this.operatorPrabayarTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.operatorPrabayarTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateOperatorPrabayarTripayDto, @Req() req: any) {
    const data = await this.operatorPrabayarTripayService.create(dto, req.user.id);
    return {
      message: 'Operator Prabayar Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOperatorPrabayarTripayDto,
    @Req() req: any,
  ) {
    const data = await this.operatorPrabayarTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Operator Prabayar Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.operatorPrabayarTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
