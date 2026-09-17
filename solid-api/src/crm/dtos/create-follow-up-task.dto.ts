import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateFollowUpTaskDto {
  @ApiProperty() @Type(() => Number) @IsInt() leadId: number;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(160) title: string;
  @ApiPropertyOptional({ default: 'Call' })
  @IsOptional()
  @IsIn(['Call', 'Email', 'LinkedIn', 'WhatsApp', 'Meeting', 'Other'])
  channel = 'Call';
  @ApiProperty() @Type(() => Date) @IsDate() dueDate: Date;
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCompleted = false;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;
  @ApiPropertyOptional() @IsOptional() @IsString() outcomeNotes?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}
