import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSecretInput {
  title: string;

  @ApiProperty()
  guid: string;

  @ApiProperty()
  slug: string | null;

  @ApiProperty()
  year: number;

  @ApiProperty()
  tagline: string | null;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  audienceRating: number;

  @ApiProperty()
  thumb: string;

  @ApiProperty()
  genres: string[];

  @ApiProperty({ required: false })
  summary?: string;
}

export class UpdateMovieInput extends PartialType(CreateSecretInput) {}
