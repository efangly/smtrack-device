import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators';
import { UpdateDeviceDto } from '../device/dto/update-device.dto';
import { JwtPayloadDto } from '../common/dto';

@Controller('configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Post()
  async create(@Body() createConfigDto: CreateConfigDto) {
    return this.configsService.create(createConfigDto);
  }

  @Get()
  async findAll() {
    return this.configsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.configsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  async update(@Request() req: { user: JwtPayloadDto }, @Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto) {
    return this.configsService.update(id, updateConfigDto, req.user);
  }

  @Patch(':id')
  async updateFirmware(@Param('id') id: string, @Body() updateConfig: UpdateDeviceDto) {
    return this.configsService.updateVersion(id, updateConfig);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER)
  async remove(@Param('id') id: string) {
    return this.configsService.remove(id);
  }
}
