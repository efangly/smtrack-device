import { Day } from '@prisma/client';
import { IsNotEmpty, IsString, IsBoolean, MaxLength, IsOptional, IsDate, IsNumber, IsEnum } from 'class-validator';

export class CreateProbeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  sn: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  channel: string;

  @IsOptional()
  @IsNumber()
  tempMin: number;

  @IsOptional()
  @IsNumber()
  tempMax: number;

  @IsOptional()
  @IsNumber()
  humiMin: number;

  @IsOptional()
  @IsNumber()
  humiMax: number;

  @IsOptional()
  @IsNumber()
  tempAdj: number;

  @IsOptional()
  @IsNumber()
  humiAdj: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  stampTime: string;

  @IsOptional()
  @IsNumber()
  doorQty: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  position: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  muteAlarmDuration: string;

  @IsOptional()
  @IsBoolean()
  doorSound: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  doorAlarmTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  muteDoorAlarmDuration: string;

  @IsOptional()
  @IsNumber()
  notiDelay: number;

  @IsOptional()
  @IsBoolean()
  notiToNormal: boolean;

  @IsOptional()
  @IsBoolean()
  notiMobile: boolean;

  @IsOptional()
  @IsNumber()
  notiRepeat: number;

  @IsOptional()
  @IsEnum(Day)
  firstDay: Day;

  @IsOptional()
  @IsEnum(Day)
  secondDay: Day;

  @IsOptional()
  @IsEnum(Day)
  thirdDay: Day;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  firstTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  secondTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  thirdTime: string;

  @IsDate()
  @IsOptional()
  createAt: Date;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
