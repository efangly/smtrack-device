import { Controller, Param, Put, Patch, Body } from '@nestjs/common';
import { AdjustService } from './adjust.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';
import { UpdateDeviceDto } from 'src/device/dto/update-device.dto';

@Controller()
export class AdjustController {
  constructor(private readonly adjustService: AdjustService) {}

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
