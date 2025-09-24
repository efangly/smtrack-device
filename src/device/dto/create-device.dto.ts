import { IsString, IsBoolean, MaxLength, IsOptional, IsDate, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty({ message: 'Device ID is required' })
  @IsString({ message: 'Device ID must be a string' })
  @MaxLength(40, { message: 'Device ID must not exceed 40 characters' })
  id: string;

  @IsOptional()
  @IsString({ message: 'Ward must be a string' })
  @MaxLength(100, { message: 'Ward must not exceed 100 characters' })
  ward: string;

  @IsOptional()
  @IsString({ message: 'Ward name must be a string' })
  @MaxLength(200, { message: 'Ward name must not exceed 200 characters' })
  wardName: string;

  @IsOptional()
  @IsString({ message: 'Hospital must be a string' })
  @MaxLength(100, { message: 'Hospital must not exceed 100 characters' })
  hospital: string;

  @IsOptional()
  @IsString({ message: 'Hospital name must be a string' })
  @MaxLength(200, { message: 'Hospital name must not exceed 200 characters' })
  hospitalName: string;

  @IsOptional()
  @IsString({ message: 'Static name must be a string' })
  @MaxLength(100, { message: 'Static name must not exceed 100 characters' })
  staticName: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean value' })
  status: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Sequence must be a number' })
  seq: number;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  location: string;

  @IsOptional()
  @IsString({ message: 'Position must be a string' })
  @MaxLength(255, { message: 'Position must not exceed 255 characters' })
  position: string;

  @IsOptional()
  @IsString({ message: 'Position picture must be a string' })
  @MaxLength(255, { message: 'Position picture URL must not exceed 255 characters' })
  positionPic: string;

  @IsOptional()
  @IsDate({ message: 'Install date must be a valid date' })
  installDate: Date;

  @IsOptional()
  @IsString({ message: 'Firmware must be a string' })
  @MaxLength(30, { message: 'Firmware version must not exceed 30 characters' })
  firmware: string;

  @IsOptional()
  @IsString({ message: 'Remark must be a string' })
  @MaxLength(255, { message: 'Remark must not exceed 255 characters' })
  remark: string;

  @IsOptional()
  @IsBoolean({ message: 'Online status must be a boolean value' })
  online: boolean;

  @IsOptional()
  @IsString({ message: 'Tag must be a string' })
  @MaxLength(100, { message: 'Tag must not exceed 100 characters' })
  tag: string;

  @IsOptional()
  @IsString({ message: 'Token must be a string' })
  @MaxLength(255, { message: 'Token must not exceed 255 characters' })
  token: string;
  
  @IsDate({ message: 'Create date must be a valid date' })
  @IsOptional()
  createAt: Date;

  @IsDate({ message: 'Update date must be a valid date' })
  @IsOptional()
  updateAt: Date;
}
