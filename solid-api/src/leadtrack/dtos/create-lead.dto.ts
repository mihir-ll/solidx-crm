import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min, ValidateNested, IsArray,
} from 'class-validator';
import { emptyStringToNullTransformer } from '@solidxai/core';
import { UpdateFollowUpTaskDto } from './update-follow-up-task.dto';

export class CreateLeadDto {
    @MaxLength(120)
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    @MaxLength(120)
    @IsOptional()
    @IsString()
    @ApiProperty()
    company?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @ApiProperty()
    industry?: string;

    @ApiPropertyOptional()
    @MaxLength(254)
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    @IsEmail()
    email?: string;

    @MaxLength(20)
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    phone: string;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    @ApiProperty()
    dealValue?: number;

    @ApiPropertyOptional({ default: 'INR' })
    @IsIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    currency: string = "INR";

    @IsIn(['PhoneCall', 'Email', 'LinkedIn', 'WhatsApp', 'Referral', 'Other'])
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    source: string;

    @ApiPropertyOptional()
    @Type(() => Date)
    @IsOptional()
    @IsDate()
    @ApiProperty()
    expectedCloseDate?: Date;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    stageId: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    stageUserKey?: string;

    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @ApiProperty()
    ownerId: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @ApiProperty()
    remarks?: string;

    @IsOptional()
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateFollowUpTaskDto)
    tasks: UpdateFollowUpTaskDto[];

    @IsOptional()
    @IsArray()
    @ApiProperty()
    tasksIds: number[];

    @IsString()
    @IsOptional()
    @ApiProperty()
    tasksCommand: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    ownerUserKey: string;
}
