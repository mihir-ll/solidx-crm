import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadTrackUserDto } from './create-lead-track-user.dto';

export class UpdateLeadTrackUserDto extends PartialType(CreateLeadTrackUserDto) {
  id?: number;
}
