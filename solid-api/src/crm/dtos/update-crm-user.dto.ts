import { PartialType } from '@nestjs/mapped-types';
import { CreateCrmUserDto } from './create-crm-user.dto';

export class UpdateCrmUserDto extends PartialType(CreateCrmUserDto) {
  id?: number;
}
