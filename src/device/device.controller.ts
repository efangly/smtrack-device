import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request, Query, Req, Patch } from '@nestjs/common';
import { DeviceService } from './device.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ChangeDeviceDto } from './dto/change-device.dto';

@Controller('device')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @Roles(Role.SUPER)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createDeviceDto: CreateDeviceDto, @UploadedFile() file: Express.Multer.File) {
    return this.deviceService.create(createDeviceDto, file);
  }

  @Get()
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN, Role.USER)
  async findAll(@Query('ward') ward: string, @Query('page') page: string, @Query('perpage') perpage: string, @Request() req: { user: JwtPayloadDto }) {
    return this.deviceService.findAll(ward, page, perpage, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Get('dashboard/count')
  async getDashboard(@Request() req: { user: JwtPayloadDto }, @Req() request: Request) {
    return this.deviceService.findDashboard(req.user, request.headers['authorization']);
  }

  @Get('dashboard/device')
  async getDeviceList(@Request() req: { user: JwtPayloadDto }) {
    return this.deviceService.deviceList(req.user);
  }

  @Put(':id')
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto, @UploadedFile() file: Express.Multer.File) {
    return this.deviceService.update(id, updateDeviceDto, file);
  }

  @Patch(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async changeDevice(@Param('id') id: string, @Body() changeDeviceDto: ChangeDeviceDto) {
    return this.deviceService.changeDevice(id, changeDeviceDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER)
  async remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }
}
