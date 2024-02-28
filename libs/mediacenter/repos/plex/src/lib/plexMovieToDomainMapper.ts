import { MediaCenterMovie } from '@plex-tinder/mediacenter/core';
import { PlexMovie } from './types';

export const plexMovieToDomainMapper = (
  movie: PlexMovie,
  plexUrl: string,
  plexToken: string,
  libraryId: number
): MediaCenterMovie => {
  return {
    title: String(movie.title),
    year: Number(movie.year),
    summary: String(movie.summary),
    genres: movie.Genre ? movie.Genre.map((genre) => String(genre.tag)) : [],
    poster: String(buildPlexMoviePosterUrl(movie, plexUrl, plexToken)),
    guid: String(movie.guid),
    slug: String(movie.slug),
    tagline: String(movie.tagline),
    duration: Number(movie.duration),
    audienceRating: movie.audienceRating ? Number(movie.audienceRating) : 0,
    viewCount: movie.viewCount ? Number(movie.viewCount) : 0,
    libraryId,
  } satisfies MediaCenterMovie;
};

export const buildPlexMoviePosterUrl = (
  movie: PlexMovie,
  plexUrl: string,
  plexToken: string
) => {
  return `${plexUrl}/photo/:/transcode?width=360&height=540&minSize=1&upscale=1&url=${movie.thumb}?X-Plex-Token=${plexToken}&X-Plex-Token=${plexToken}`;
};
