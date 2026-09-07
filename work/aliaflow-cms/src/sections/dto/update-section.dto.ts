import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  data: Record<string, unknown>;
}
