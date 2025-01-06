import { Controller, Param, Delete } from '@nestjs/common';
import { LogdayService } from './logday.service';

@Controller('logday')
export class LogdayController {
  constructor(private readonly logdayService: LogdayService) {}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logdayService.remove(id);
  }
}
