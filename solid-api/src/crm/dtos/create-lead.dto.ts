import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  Min,
} from 'class-validator';

export class CreateLeadDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() industry?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(20) phone: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dealValue?: number;
  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsIn(['INR', 'USD', 'EUR', 'GBP', 'AED'])
  currency = 'INR';
  @ApiProperty()
  @IsIn(['PhoneCall', 'Email', 'LinkedIn', 'WhatsApp', 'Referral', 'Other'])
  source: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expectedCloseDate?: Date;
  @ApiPropertyOptional({ default: 'New' })
  @IsOptional()
  @IsIn([
    'New',
    'FirstContactPending',
    'FollowUp',
    'MeetingSet',
    'MeetingPending',
    'OpportunityGenerated',
    'Dead',
    'WrongLeadInfo',
  ])
  stage = 'New';
  @ApiProperty() @Type(() => Number) @IsInt() ownerId: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
