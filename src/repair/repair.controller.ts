import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { RepairService } from './repair.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('repair')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  @Roles(Role.SUPER, Role.SERVICE)
  create(@Body() createRepairDto: CreateRepairDto) {
    return this.repairService.create(createRepairDto);
  }

  @Get()
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  findAll() {
    return this.repairService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.repairService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  update(@Param('id') id: string, @Body() updateRepairDto: UpdateRepairDto) {
    return this.repairService.update(id, updateRepairDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  remove(@Param('id') id: string) {
    return this.repairService.remove(id);
  }
}
