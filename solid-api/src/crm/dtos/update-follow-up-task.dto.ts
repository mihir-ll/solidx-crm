import { PartialType } from '@nestjs/mapped-types';
import { CreateFollowUpTaskDto } from './create-follow-up-task.dto';

export class UpdateFollowUpTaskDto extends PartialType(CreateFollowUpTaskDto) {
  id?: number;
}
