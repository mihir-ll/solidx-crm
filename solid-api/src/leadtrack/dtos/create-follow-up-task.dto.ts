import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateFollowUpTaskDto {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    leadId: number;

    @MaxLength(160)
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    title: string;

    @ApiPropertyOptional({ default: 'Call' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    channel: string = "Call";

    @Type(() => Date)
    @IsNotEmpty()
    @IsDate()
    @ApiProperty()
    dueDate: Date;

    @ApiPropertyOptional({ default: false })
    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty()
    isCompleted: boolean = false;

    @ApiPropertyOptional()
    @Type(() => Date)
    @IsOptional()
    @IsDate()
    @ApiProperty()
    completedAt?: Date;

    @ApiPropertyOptional()
    @ValidateIf((task) => task.isCompleted === true || task.isCompleted === 'true')
    @IsNotEmpty({ message: 'Outcome notes are required when a follow-up task is completed.' })
    @IsString()
    @ApiProperty()
    outcomeNotes?: string;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @ApiProperty()
    assignedToId?: number;

    @IsString()
    @IsOptional()
    @ApiProperty()
    assignedToUserKey: string;


@IsNotEmpty()
@IsBoolean()
@ApiProperty()
autoCreated: boolean = false;

}
