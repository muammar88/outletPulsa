import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async getAll(@Req() req: any) {
    const user = req.user || {};
    // Sesuaikan parameter dengan yang diharapkan oleh menuService: uuid, idPegawai, role
    // Asumsi dari jwt payload: kode = uuid, id = idPegawai, type = role
    return await this.menuService.getAll(user.kode || '', user.id || 0, user.type || 'admin');
    
    // return {
    //   message: 'Success',
    //   error: null,
    //   data: {
    //     menus: menus,
    //   },
    // };
  }
}
