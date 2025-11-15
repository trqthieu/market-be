import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: ['percent', 'fixed'] })
  @IsEnum(['percent', 'fixed'], {
    message: 'Status must be one of: percent, fixed',
  })
  discountType: 'percent' | 'fixed';

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discountValue: number;

  @ApiProperty({ required: false })
  // @IsDateString()
  @IsOptional()
  startAt?: Date;

  @ApiProperty({ required: false })
  // @IsDateString()
  @IsOptional()
  endAt?: Date;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
