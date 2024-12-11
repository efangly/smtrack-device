import { IsNotEmpty, IsString, IsBoolean, MaxLength, IsOptional, IsDate } from 'class-validator';

export class CreateConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  sn: string;

  @IsOptional()
  @IsBoolean()
  dhcp: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ip: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mac: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subnet: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gateway: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dns: string;

  @IsOptional()
  @IsBoolean()
  dhcpEth: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ipEth: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  macEth: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  subnetEth: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gatewayEth: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dnsEth: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ssid: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  simSP: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email1: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email2: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email3: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  hardReset: string;

  @IsDate()
  @IsOptional()
  createAt: Date;

  @IsDate()
  @IsOptional()
  updateAt: Date;
}
