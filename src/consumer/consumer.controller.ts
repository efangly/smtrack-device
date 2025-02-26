import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Ctx, Payload, RmqContext } from '@nestjs/microservices';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { ConsumerService } from './consumer.service';

@Controller()
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}
  private readonly logger = new Logger(ConsumerController.name);

  @EventPattern('log-device')
  async backup(@Payload() data: CreateLogdayDto, @Ctx() context: RmqContext) {
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
}
