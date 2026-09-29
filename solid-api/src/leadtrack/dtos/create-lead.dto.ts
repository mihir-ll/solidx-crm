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
  Min, ValidateNested, IsArray, IsUrl, Matches,
} from 'class-validator';
import { emptyStringToNullTransformer } from '@solidxai/core';
import { UpdateFollowUpTaskDto } from './update-follow-up-task.dto';

export class CreateLeadDto {
    @MaxLength(120)
    @IsNotEmpty()
    @Matches(/^[A-Za-z][A-Za-z.]*(?: [A-Za-z][A-Za-z.]*)*$/, { message: "Please enter a valid contact name using letters, spaces, and periods." })
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
    @IsOptional()
    @IsString()
    @ApiProperty()
    leadType?: string;

    @ApiPropertyOptional()
    @MaxLength(120)
    @IsOptional()
    @IsString()
    @ApiProperty()
    city?: string;

    @ApiPropertyOptional()
    @MaxLength(120)
    @IsOptional()
    @IsString()
    @ApiProperty()
    designation?: string;

    @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
    @Transform(emptyStringToNullTransformer)
    @IsUrl({ require_protocol: true })
    @MaxLength(500)
    @IsOptional()
    @IsString()
    @ApiProperty()
    linkedIn?: string;

    @ApiPropertyOptional()
    @MaxLength(254)
    @IsOptional()
    @IsString()
    @ApiProperty()
    @Transform(emptyStringToNullTransformer)
    @IsEmail()
    email?: string;

    @MaxLength(20)
    @IsNotEmpty()
    @Matches(/^\+?[0-9]{7,15}$/, { message: "Please enter a valid phone number" })
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
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    currency: string = "INR";

    @Transform(({ value }) => Array.isArray(value) ? JSON.stringify(value) : value)
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

    @ApiPropertyOptional()
    @Type(() => Date)
    @IsOptional()
    @IsDate()
    @ApiProperty()
    meetingDate?: Date;

    @ApiPropertyOptional({ description: 'Pipeline stage', default: 'new' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    stage?: string = "new";

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
