import { ApiProperty } from '@nestjs/swagger';
import { ClientSecret as PrismaSecret } from '@prisma/client';

export class Secret implements PrismaSecret {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  secret: string;

  @ApiProperty()
  mediacenter: 'PLEX';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  plexUrl: string;

  @ApiProperty()
  plexToken: string;

  @ApiProperty({ required: false, nullable: true })
  movieSectionId: number | null;
}
