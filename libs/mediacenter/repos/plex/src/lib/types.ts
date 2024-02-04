export type PlexLibrary = {
  MediaContainer: {
    size: number;
    allowSync: boolean;
    art: string;
    identifier: string;
    librarySectionID: number;
    librarySectionTitle: string;
    librarySectionUUID: string;
    mediaTagPrefix: string;
    mediaTagVersion: number;
    thumb: string;
    title1: string;
    title2: string;
    viewGroup: string;
    viewMode: number;
    mixedParents: boolean;
    Metadata: PlexMovie[];
  };
};

export type PlexMovie = {
  ratingKey: string;
  slug?: string;
  key: string;
  guid: string;
  studio: string;
  type: string;
  title: string;
  contentRating: string;
  summary: string;
  rating: number;
  audienceRating?: number;
  year: number;
  tagline?: string;
  thumb: string;
  art: string;
  duration: number;
  originallyAvailableAt: string;
  addedAt: number;
  updatedAt: number;
  audienceRatingImage: string;
  chapterSource: string;
  primaryExtraKey: string;
  ratingImage: string;
  Media: PlexMedia[];
  Genre: PlexGenre[];
  Country: PlexCountry[];
  Director: PlexDirector[];
  Writer: PlexWriter[];
  Role: PlexRole[];
  titleSort: string;
  viewCount?: number;
  lastViewedAt: number;
  originalTitle: string;
  viewOffset: number;
  skipCount: number;
  index: number;
  theme: string;
  leafCount: number;
  viewedLeafCount: number;
  childCount: number;
  hasPremiumExtras: string;
  hasPremiumPrimaryExtra: string;
  parentRatingKey: string;
  parentGuid: string;
  parentStudio: string;
  parentKey: string;
  parentTitle: string;
  parentIndex: number;
  parentYear: number;
  parentThumb: string;
  parentTheme: string;
  grandparentRatingKey: string;
  grandparentGuid: string;
  grandparentKey: string;
  grandparentTitle: string;
  grandparentThumb: string;
  grandparentArt: string;
  grandparentTheme: string;
};

export type PlexMedia = {
  id: number;
  duration: number;
  bitrate: number;
  width: number;
  height: number;
  aspectRatio: number;
  audioChannels: number;
  audioCodec: string;
  videoCodec: string;
  videoResolution: string;
  container: string;
  videoFrameRate: string;
  videoProfile: string;
  Part: PlexPart[];
};

export type PlexPart = {
  id: number;
  key: string;
  duration: number;
  file: string;
  size: number;
  container: string;
  videoProfile: string;
};

export type PlexGenre = {
  tag: string;
};

export type PlexCountry = {
  tag: string;
};

export type PlexDirector = {
  tag: string;
};

export type PlexWriter = {
  tag: string;
};

export type PlexRole = {
  tag: string;
};

export type PlexGenreRequest = {
  MediaContainer: {
    size: number;
    allowSync: boolean;
    art: string;
    content: string;
    identifier: string;
    mediaTagPrefix: string;
    mediaTagVersion: number;
    thumb: string;
    title1: string;
    title2: string;
    viewGroup: string;
    viewMode: number;
    Directory: PlexGenreDirectory[];
  };
};

export type PlexGenreDirectory = {
  fastKey: string;
  key: number;
  title: string;
  type: string;
};

export enum MoviesCategory {
  ALL = 'all',
  RECENTLY_ADDED = 'recentlyAdded',
  NEWEST = 'newest',
  UNWATCHED = 'unwatched',
}
