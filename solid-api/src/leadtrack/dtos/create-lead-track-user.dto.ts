import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '@solidxai/core';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadTrackUserDto extends CreateUserDto {
    @IsIn(['Admin', 'SalesRepresentative'])
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ enum: ['Admin', 'SalesRepresentative'] })
    userType: string = "SalesRepresentative";
}
