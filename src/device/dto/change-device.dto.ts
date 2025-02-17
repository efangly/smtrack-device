import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChangeDeviceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  id: string;
}
