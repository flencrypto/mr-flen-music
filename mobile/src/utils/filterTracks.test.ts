import { filterByArtist, searchTracks } from './filterTracks'
import { tracks } from '../data/tracks'

describe('filterByArtist', () => {
  it('filters tracks by given artist', () => {
    expect(filterByArtist(tracks, 'Mr.FLEN')).toHaveLength(2)
    expect(filterByArtist(tracks, 'Other')).toHaveLength(0)
  })
})

describe('searchTracks', () => {
  it('filters tracks by title or artist', () => {
    expect(searchTracks(tracks, 'night')).toHaveLength(1)
    expect(searchTracks(tracks, 'mr.flen')).toHaveLength(2)
    expect(searchTracks(tracks, 'missing')).toHaveLength(0)
  })
})
