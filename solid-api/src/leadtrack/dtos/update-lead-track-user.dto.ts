import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadTrackUserDto } from './create-lead-track-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class UpdateLeadTrackUserDto extends PartialType(CreateLeadTrackUserDto) {
  id?: number;


@IsNotEmpty()
@IsOptional()
@IsString()
@ApiProperty()
userType: string;

}
