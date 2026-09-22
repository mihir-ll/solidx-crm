import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '@solidxai/core';
import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateCrmUserDto extends CreateUserDto {
  @ApiProperty({ enum: ['Admin', 'SalesRepresentative'] })
  @IsNotEmpty()
  @IsIn(['Admin', 'SalesRepresentative'])
  userType: string;
}
