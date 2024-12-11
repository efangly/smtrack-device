import { IsNotEmpty, IsString, MaxLength, IsOptional, IsDate, IsNumber, IsBoolean } from 'class-validator';

export class CreateWarrantyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  devName: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  product: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  model: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  installDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(155)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  saleDepartment: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  invoice: string;

  @IsOptional()
  @IsDate()
  expire: Date;

  @IsOptional()
  @IsBoolean()
  status: boolean;

  @IsDate()
  @IsOptional()
  createAt: Date;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
