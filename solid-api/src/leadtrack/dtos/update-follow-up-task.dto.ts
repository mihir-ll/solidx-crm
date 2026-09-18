import { PartialType } from '@nestjs/mapped-types';
import { CreateFollowUpTaskDto } from './create-follow-up-task.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { MaxLength, IsDate, IsBoolean, IsInt } from 'class-validator';

export class UpdateFollowUpTaskDto extends PartialType(CreateFollowUpTaskDto) {
    id?: number;

    @MaxLength(160)
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    title: string;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @ApiProperty()
    channel: string;

    @IsNotEmpty()
    @IsOptional()
    @IsDate()
    @ApiProperty()
    dueDate: Date;

    @IsNotEmpty()
    @IsOptional()
    @IsBoolean()
    @ApiProperty()
    isCompleted: boolean;

    @IsOptional()
    @IsDate()
    @ApiProperty()
    completedAt: Date;

    @IsOptional()
    @IsString()
    @ApiProperty()
    outcomeNotes: string;

    @IsOptional()
    @IsInt()
    @ApiProperty()
    assignedToId: number;

    @IsString()
    @IsOptional()
    @ApiProperty()
    assignedToUserKey: string;
}
