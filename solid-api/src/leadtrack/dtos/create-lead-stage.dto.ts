import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeadStageDto {
  @ApiProperty()
  @MaxLength(80)
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @MaxLength(80)
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiPropertyOptional({ default: 10 })
  @Min(0)
  @IsInt()
  @IsOptional()
  sequence: number = 10;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isTerminal: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isWon: boolean = false;
}
