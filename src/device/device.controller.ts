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
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.SUPER)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Request() req: { user: JwtPayloadDto }, @Body() createDeviceDto: CreateDeviceDto, @UploadedFile() file: Express.Multer.File) {
    return this.deviceService.create(createDeviceDto, file, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN, Role.USER)
  async findAll(
    @Query('filter') filter: string,
    @Query('ward') ward: string,
    @Query('page') page: string,
    @Query('perpage') perpage: string,
    @Request() req: { user: JwtPayloadDto }
  ) {
    return this.deviceService.findAll(filter, ward, page, perpage, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard/count')
  async getDashboard(@Request() req: { user: JwtPayloadDto }, @Req() request: Request) {
    return this.deviceService.findDashboard(req.user, request.headers['authorization']);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard/device')
  async getDeviceList(@Request() req: { user: JwtPayloadDto }) {
    return this.deviceService.deviceList(req.user);
  }

  @Get('info/device')
  async getDeviceInfo() {
    return this.deviceService.deviceInfo();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles(Role.SUPER, Role.SERVICE, Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async update(@Request() req: { user: JwtPayloadDto }, @Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto, @UploadedFile() file: Express.Multer.File) {
    return this.deviceService.update(id, updateDeviceDto, file, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.SUPER, Role.SERVICE)
  async changeDevice(@Request() req: { user: JwtPayloadDto }, @Param('id') id: string, @Body() changeDeviceDto: ChangeDeviceDto) {
    return this.deviceService.changeDevice(id, changeDeviceDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.SUPER)
  async remove(@Param('id') id: string) {
    return this.deviceService.remove(id);
  }
}
