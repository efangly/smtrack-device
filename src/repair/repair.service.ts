import { Injectable } from '@nestjs/common';
import { format } from "date-fns"
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RepairService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) { }
  async create(repairDto: CreateRepairDto) {
    repairDto.id = `RID-${format(new Date(), "yyyyMMddHHmmssSSS")}`;
    const seq = await this.prisma.repairs.findMany({ take: 1, orderBy: { createAt: 'desc' } });
    repairDto.seq = seq.length === 0 ? 1 : seq[0].seq + 1;
    repairDto.createAt = dateFormat(new Date());
    repairDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.repairs.create({ data: repairDto });
    await this.redis.del('repair');
    return result;
  }

  async findAll(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.repairs.findMany({
      where: conditions,
      include: {
        device: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createAt: 'desc' }
    });
    if (result.length > 0) await this.redis.set(key, JSON.stringify(result), 3600 * 6);
    return result;
  }

  async findOne(id: string) {
    return this.prisma.repairs.findUnique({ where: { id: id } });
  }

  async update(id: string, repairDto: UpdateRepairDto) {
    repairDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.repairs.update({ where: { id }, data: repairDto });
    await this.redis.del('repair');
    return result;
  }

  async remove(id: string) {
    const result = await this.prisma.repairs.delete({ where: { id } });
    await this.redis.del('repair');
    return result;
  }

  private findCondition(user: JwtPayloadDto): { conditions: Prisma.RepairsWhereInput | undefined, key: string } {
    let conditions: Prisma.RepairsWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "ADMIN":
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
        key = `repair:${user.hosId}`;
        break;
      case "USER":
        conditions = { device: { ward: user.wardId } };
        key = `repair:${user.wardId}`;
        break;
      case "SERVICE":
        conditions = {
          NOT: [
            { device: { hospital: 'HID-DEVELOPMENT' } },
            { device: { ward: 'WID-DEVELOPMENT' } }
          ]
        };
        key = "repair:HID-DEVELOPMENT";
        break;
      default:
        conditions = undefined;
        key = "repair";
    }
    return { conditions, key };
  }
}
