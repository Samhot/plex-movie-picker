import { MediaCenterGenre } from '@plex-tinder/mediacenter/core';
import { PlexGenreDirectory } from './types';

export const plexGenreToDomainMapper = (
  genre: PlexGenreDirectory
): MediaCenterGenre => {
  return {
    id: genre.key,
    name: genre.title,
  };
};
