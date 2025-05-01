import { Controller, Param, Put, Patch, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AdjustService } from './adjust.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';
import { UpdateDeviceDto } from '../device/dto/update-device.dto';
import { JwtAuthGuard } from '../common/guards';

@Controller()
export class AdjustController {
  constructor(private readonly adjustService: AdjustService) {}

  @UseGuards(JwtAuthGuard)
  @Get('online')
  async onlineStatus(@Query('hospital') hospital: string, @Query('ward') ward: string) {
    return this.adjustService.getOnlineStatus(hospital, ward);
  }

  @Put('adjust/:id')
  async updateProbe(@Param('id') id: string, @Body() updateConfig: UpdateProbeDto) {
    return this.adjustService.updateProbe(id, updateConfig);
  }

  @Patch('adjust/:id')
  async updateConfig(@Param('id') id: string, @Body() updateConfig: UpdateConfigDto) {
    return this.adjustService.updateConfig(id, updateConfig);
  }

  @Patch('changename/:id')
  async updateDeviceName(@Param('id') id: string, @Body() updateDevice: UpdateDeviceDto) {
    return this.adjustService.updateDeviceName(id, updateDevice);
  }
}
