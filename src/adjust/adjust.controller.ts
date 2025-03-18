import { Controller, Param, Put, Patch, Body } from '@nestjs/common';
import { AdjustService } from './adjust.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';

@Controller('adjust')
export class AdjustController {
  constructor(private readonly adjustService: AdjustService) {}

  @Put(':id')
  async updateProbe(@Param('id') id: string, @Body() updateConfig: UpdateProbeDto) {
    return this.adjustService.updateProbe(id, updateConfig);
  }

  @Patch(':id')
  async updateConfig(@Param('id') id: string, @Body() updateConfig: UpdateConfigDto) {
    return this.adjustService.updateConfig(id, updateConfig);
  }
}
