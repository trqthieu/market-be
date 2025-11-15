import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['pending', 'paid', 'shipping', 'completed', 'cancelled'],
  })
  @IsEnum(['pending', 'paid', 'shipping', 'completed', 'cancelled'], {
    message:
      'Status must be one of: pending, paid, shipping, completed, cancelled',
  })
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
}
