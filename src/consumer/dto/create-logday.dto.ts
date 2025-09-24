import { IsString, IsBoolean, MaxLength, IsOptional, IsDate, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateLogdayDto {
  @IsOptional()
  @IsString({ message: 'ID must be a string' })
  @MaxLength(100, { message: 'ID must not exceed 100 characters' })
  id: string;

  @IsNotEmpty({ message: 'Serial number is required' })
  @IsString({ message: 'Serial number must be a string' })
  @MaxLength(100, { message: 'Serial number must not exceed 100 characters' })
  serial: string;

  @IsOptional()
  @IsNumber({}, { message: 'Temperature must be a number' })
  @Min(-160, { message: 'Temperature must be at least -160°C' })
  @Max(100, { message: 'Temperature must not exceed 100°C' })
  temp: number;

  @IsOptional()
  @IsNumber({}, { message: 'Temperature display must be a number' })
  @Min(-160, { message: 'Temperature display must be at least -160°C' })
  @Max(100, { message: 'Temperature display must not exceed 100°C' })
  tempDisplay: number;

  @IsOptional()
  @IsNumber({}, { message: 'Humidity must be a number' })
  @Min(0, { message: 'Humidity must be at least 0%' })
  @Max(100, { message: 'Humidity must not exceed 100%' })
  humidity: number;

  @IsOptional()
  @IsNumber({}, { message: 'Humidity display must be a number' })
  @Min(0, { message: 'Humidity display must be at least 0%' })
  @Max(100, { message: 'Humidity display must not exceed 100%' })
  humidityDisplay: number;

  @IsOptional()
  @IsDate({ message: 'Send time must be a valid date' })
  sendTime: Date;

  @IsOptional()
  @IsBoolean({ message: 'Plug status must be a boolean value' })
  plug: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Door1 status must be a boolean value' })
  door1: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Door2 status must be a boolean value' })
  door2: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Door3 status must be a boolean value' })
  door3: boolean;

  @IsOptional()
  @IsBoolean()
  internet: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  probe: string;

  @IsOptional()
  @IsNumber()
  battery: number;

  @IsOptional()
  @IsNumber()
  tempInternal: number;

  @IsOptional()
  @IsBoolean()
  extMemory: boolean;
  
  @IsDate()
  @IsOptional()
  createAt: Date;

  @IsDate()
  @IsOptional()
  updateAt: Date;

  @IsDate()
  @IsOptional()
  expire: Date;
}
