import { ApiProperty } from '@nestjs/swagger';
import { Movie as PrismaMovie } from '@prisma/client';

export class Movie implements PrismaMovie {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  guid!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  tagline!: string;

  @ApiProperty()
  duration!: number;

  @ApiProperty()
  audienceRating!: number;

  @ApiProperty({ required: false, nullable: true })
  summary!: string | null;

  @ApiProperty()
  thumb!: string;

  @ApiProperty()
  genres!: string[];
}
