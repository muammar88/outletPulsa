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
import { OperatorTripayService } from './operator_tripay.service';
import { GetOperatorTripayDto } from './dto/get-operator-tripay.dto';
import { CreateOperatorTripayDto } from './dto/create-operator-tripay.dto';
import { UpdateOperatorTripayDto } from './dto/update-operator-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/operator-tripay')
@UseGuards(JwtAuthGuard)
export class OperatorTripayController {
  constructor(private readonly operatorTripayService: OperatorTripayService) {}

  @Get()
  async findAll(@Query() query: GetOperatorTripayDto) {
    const data = await this.operatorTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.operatorTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateOperatorTripayDto, @Req() req: any) {
    const data = await this.operatorTripayService.create(dto, req.user.id);
    return {
      message: 'Operator Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOperatorTripayDto,
    @Req() req: any,
  ) {
    const data = await this.operatorTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Operator Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.operatorTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
