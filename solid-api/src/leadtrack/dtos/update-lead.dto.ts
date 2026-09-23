import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { MaxLength, IsEmail, IsNumber, IsDate, IsInt, ValidateNested, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { emptyStringToNullTransformer } from '@solidxai/core';
import { UpdateFollowUpTaskDto } from './update-follow-up-task.dto';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
    id?: number;

    @MaxLength(120)
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    name: string;

    @MaxLength(120)
    @IsOptional()
    @IsString()
    @ApiProperty()
    company: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    industry: string;

    @MaxLength(254)
    @IsOptional()
    @IsString()
    @ApiProperty()
    @Transform(emptyStringToNullTransformer)
    @IsEmail()
    email: string;

    @MaxLength(20)
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    phone: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty()
    dealValue: number;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    currency: string;

    @Transform(({ value }) => Array.isArray(value) ? JSON.stringify(value) : value)
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    source: string;

    @IsOptional()
    @IsDate()
    @ApiProperty()
    expectedCloseDate: Date;

    @IsOptional()
    @IsInt()
    @ApiProperty()
    ownerId: number;

    @IsString()
    @IsOptional()
    @ApiProperty()
    ownerUserKey: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    remarks: string;

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

    @IsOptional()
    @IsDate()
    @ApiProperty()
    meetingDate: Date;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    stage: string;
}
