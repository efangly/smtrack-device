import { NestFactory, Reflector } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JsonLogger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new JsonLogger() });
  const reflector = app.get(Reflector);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('devices');
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ],
      queue: 'log_device_queue',
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 1
    }
  });
  await microservice.listen();
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
