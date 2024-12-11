import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Controller('warranty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post()
  create(@Body() createWarrantyDto: CreateWarrantyDto) {
    return this.warrantyService.create(createWarrantyDto);
  }

  @Get()
  findAll() {
    return this.warrantyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warrantyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWarrantyDto: UpdateWarrantyDto) {
    return this.warrantyService.update(id, updateWarrantyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warrantyService.remove(id);
  }
}
