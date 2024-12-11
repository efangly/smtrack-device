import { IsNotEmpty, IsString, MaxLength, IsOptional, IsDate, IsNumber } from 'class-validator';

export class CreateRepairDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id: string;

  @IsOptional()
  @IsNumber()
  seq: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  devName: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  info: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  info1: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  info2: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  ward: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  detail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  status: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  warrantyStatus: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  remark: string;

  @IsDate()
  @IsOptional()
  createAt: Date;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
