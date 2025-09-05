import type { Track } from '../data/tracks'

export function filterByArtist (list: Track[], artist: string): Track[] {
  return list.filter(track => track.artist === artist)
}
