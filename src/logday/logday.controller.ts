import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { LogdayService } from './logday.service';
import { CreateLogdayDto } from './dto/create-logday.dto';

@Controller('logday')
export class LogdayController {
  constructor(private readonly logdayService: LogdayService) {}

  @Post()
  create(@Body() createLogdayDto: CreateLogdayDto) {
    return this.logdayService.create(createLogdayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logdayService.remove(id);
  }
}
