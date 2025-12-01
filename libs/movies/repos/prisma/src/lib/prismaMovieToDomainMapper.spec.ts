import { prismaMovieToDomainMapper } from './prismaMovieToDomainMapper';

describe('prismaMovieToDomainMapper', () => {
  it('should map a prisma movie to a domain movie', () => {
    expect(
      prismaMovieToDomainMapper({
        id: '1',
        title: 'The Movie',
            tagline: 'The Movie Description',
        year: 2020,
        duration: 120,
        genres: [{ id: 1, name: 'Action' }],
        audienceRating: 5,
        summary: 'The Movie Summary',
        poster: 'The Movie Poster',
        viewCount: 100,
        guid: '1',
        slug: 'the-movie',
      })
    ).toEqual({
      id: '1',
      title: 'The Movie',
      description: 'The Movie Description',
      year: 2020,
      duration: 120,
      genres: [{ id: '1', name: 'Action' }],
    });
  });
});
