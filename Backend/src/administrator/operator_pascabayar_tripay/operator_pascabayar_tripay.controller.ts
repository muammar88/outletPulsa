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
import { OperatorPascabayarTripayService } from './operator_pascabayar_tripay.service';
import { GetOperatorPascabayarTripayDto } from './dto/get-operator-pascabayar-tripay.dto';
import { CreateOperatorPascabayarTripayDto } from './dto/create-operator-pascabayar-tripay.dto';
import { UpdateOperatorPascabayarTripayDto } from './dto/update-operator-pascabayar-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/operator-pascabayar-tripay')
@UseGuards(JwtAuthGuard)
export class OperatorPascabayarTripayController {
  constructor(private readonly operatorPascabayarTripayService: OperatorPascabayarTripayService) {}

  @Get()
  async findAll(@Query() query: GetOperatorPascabayarTripayDto) {
    const data = await this.operatorPascabayarTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.operatorPascabayarTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateOperatorPascabayarTripayDto, @Req() req: any) {
    const data = await this.operatorPascabayarTripayService.create(dto, req.user.id);
    return {
      message: 'Operator Pascabayar Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOperatorPascabayarTripayDto,
    @Req() req: any,
  ) {
    const data = await this.operatorPascabayarTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Operator Pascabayar Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.operatorPascabayarTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
