import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';
import { JwtPayloadDto } from '../common/dto';
import { Prisma } from '@prisma/client';
import { format } from "date-fns"
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WarrantyService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) { }
  async create(warrantyDto: CreateWarrantyDto) {
    warrantyDto.id = `WID-${format(new Date(), "yyyyMMddHHmmssSSS")}`;
    warrantyDto.createAt = dateFormat(new Date());
    warrantyDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.warranties.create({ data: warrantyDto });
    await this.redis.del('warranty');
    return result;
  }

  async findAll(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.warranties.findMany({
      where: conditions,
      include: {
        device: {
          select: {
            id: true,
            name: true,
            location: true,
            position: true,
            probe: { select: { name: true } }
          }
        }
      },
      orderBy: { createAt: 'asc' }
    });
    if (result.length > 0) await this.redis.set(key, JSON.stringify(result), 3600 * 6);
    return result;
  }

  async findOne(id: string) {
    return this.prisma.warranties.findUnique({ where: { id: id } });
  }

  async update(id: string, warrantyDto: UpdateWarrantyDto) {
    warrantyDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.warranties.update({ where: { id }, data: warrantyDto });
    await this.redis.del('warranty');
    return result
  }

  async remove(id: string) {
    const result = await this.prisma.warranties.delete({ where: { id: id } });
    await this.redis.del('warranty');
    return result;
  }

  private findCondition(user: JwtPayloadDto): { conditions: Prisma.WarrantiesWhereInput | undefined, key: string } {
    let conditions: Prisma.WarrantiesWhereInput | undefined = undefined;
    let key = '';
    switch (user.role) {
      case 'ADMIN':
        conditions = {
          AND: [
            { device: { hospital: user.hosId } },
            {
              NOT: [
                { device: { hospital: 'HID-DEVELOPMENT' } },
                { device: { ward: 'WID-DEVELOPMENT' } }
              ]
            }
          ]
        };
        key = `warranty:${user.hosId}`;
        break;
      case 'LEGACY_ADMIN':
        conditions = {
          AND: [
            { device: { hospital: user.hosId } },
            {
              NOT: [
                { device: { hospital: 'HID-DEVELOPMENT' } },
                { device: { ward: 'WID-DEVELOPMENT' } }
              ]
            }
          ]
        };
        key = `warranty:${user.hosId}`;
        break;
      case 'USER':
        conditions = { device: { ward: user.wardId } };
        key = `warranty:${user.wardId}`;
        break;
      case 'LEGACY_USER':
        conditions = { device: { ward: user.wardId } };
        key = `warranty:${user.wardId}`;
        break;
      case 'SERVICE':
        conditions = {
          NOT: [
            { device: { hospital: 'HID-DEVELOPMENT' } },
            { device: { ward: 'WID-DEVELOPMENT' } }
          ]
        };
        key = 'warranty:HID-DEVELOPMENT';
        break;
      default:
        conditions = undefined;
        key = 'warranty';
    }
    return { conditions, key };
  }
}
