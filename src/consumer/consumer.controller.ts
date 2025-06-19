import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { ConsumerService } from './consumer.service';
import { OnlineDto } from './dto/online.dto';
import { UpdateDeviceDto } from '../device/dto/update-device.dto';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { CreateRepairDto } from '../repair/dto/create-repair.dto';
import { CreateWarrantyDto } from '../warranty/dto/create-warranty.dto';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}
  private readonly logger = new Logger(ConsumerController.name);

  @EventPattern('log-device')
  async log(@Payload() data: CreateLogdayDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.createLog(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('online')
  async online(@Payload() data: OnlineDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.online(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('update-hospital')
  async updateHospital(@Payload() data: { id: string, name: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.updateHospital(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }
  @EventPattern('update-ward')
  async updateWard(@Payload() data: { id: string, name: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.updateWard(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('update-device')
  async updateDevice(@Payload() data: { id: string, device: UpdateDeviceDto }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.updateDevice(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('update-config')
  async updateConfig(@Payload() data: { id: string, config: UpdateConfigDto }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.updateConfig(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('update-probe')
  async updateProbe(@Payload() data: { id: string, probe: UpdateProbeDto }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.updateProbe(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('create-repair')
  async createRepair(@Payload() data: CreateRepairDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.createRepair(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('create-warranty')
  async createWarranty(@Payload() data: CreateWarrantyDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      await this.consumerService.createWarranty(data);
      channel.ack(message);
    } catch (error) {
      this.logger.error(error);
      channel.nack(message, false, false);
    }
  }
}
