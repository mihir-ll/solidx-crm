import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '@solidxai/core';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadTrackUserDto extends CreateUserDto {
  @ApiProperty({ enum: ['Admin', 'SalesRepresentative'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Admin', 'SalesRepresentative'])
  userType: 'Admin' | 'SalesRepresentative';
}
