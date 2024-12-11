import { PartialType } from '@nestjs/mapped-types';
import { CreateProbeDto } from './create-probe.dto';

export class UpdateProbeDto extends PartialType(CreateProbeDto) {}
