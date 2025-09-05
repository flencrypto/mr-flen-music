import { filterByArtist } from './filterTracks'
import { tracks } from '../data/tracks'

describe('filterByArtist', () => {
  it('filters tracks by given artist', () => {
    expect(filterByArtist(tracks, 'Mr.FLEN')).toHaveLength(2)
    expect(filterByArtist(tracks, 'Other')).toHaveLength(0)
  })
})
