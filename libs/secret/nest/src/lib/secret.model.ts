import { ApiProperty } from '@nestjs/swagger';
import { MediaSource as PrismaMediaSource, MediaCenter } from '@prisma/client';

export class Secret implements PrismaMediaSource {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: MediaCenter })
  type: MediaCenter;
  
  @ApiProperty()
  url: string;

  @ApiProperty()
  credentials: any;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
