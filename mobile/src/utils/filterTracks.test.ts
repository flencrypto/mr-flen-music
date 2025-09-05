import { filterByArtist, searchTracks, getTrending } from './filterTracks'
import { tracks } from '../data/tracks'

describe('filterByArtist', () => {
  it('filters tracks by given artist', () => {
    expect(filterByArtist(tracks, 'Mr.FLEN')).toHaveLength(2)
    expect(filterByArtist(tracks, 'Other')).toHaveLength(0)
  })
})

describe('getTrending', () => {
  it('returns tracks sorted by play count', () => {
    const trending = getTrending(tracks, 2)
    expect(trending).toHaveLength(2)
    expect(trending[0].title).toBe('Night Drive')
  })
})

describe('searchTracks', () => {
  it('filters tracks by title or artist', () => {
    expect(searchTracks(tracks, 'night')).toHaveLength(1)
    expect(searchTracks(tracks, 'mr.flen')).toHaveLength(2)
    expect(searchTracks(tracks, 'missing')).toHaveLength(0)
  })
})
