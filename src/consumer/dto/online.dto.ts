import { IsString, IsBoolean, MaxLength, IsOptional } from 'class-validator';

export class OnlineDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sn: string;

  @IsOptional()
  @IsBoolean()
  status: boolean;
}