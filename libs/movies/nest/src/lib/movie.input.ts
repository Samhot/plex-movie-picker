import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMovieInput {
  title: string;

  @ApiProperty()
  guid: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  tagline: string;

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

export class UpdateMovieInput extends PartialType(CreateMovieInput) {}
