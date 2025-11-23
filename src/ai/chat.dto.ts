import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty()
  @IsString()
  message: string;
}
