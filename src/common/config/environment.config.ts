import { IsString, IsNumber, IsOptional } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  NODE_ENV: string = 'development';

  @IsString()
  DATABASE_URL: string;

  @IsString()
  RABBITMQ: string;

  @IsOptional()
  @IsNumber()
  PORT: number = 8080;

  @IsString()
  DEVICE_SECRET: string;

  @IsOptional()
  @IsString()
  LOG_URL: string;

  @IsOptional()
  @IsString()
  UPLOAD_PATH: string;

  @IsOptional()
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsOptional()
  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD: string;
}