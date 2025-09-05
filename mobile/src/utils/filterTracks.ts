import type { Track } from '../data/tracks'

export function filterByArtist (list: Track[], artist: string): Track[] {
  return list.filter(track => track.artist === artist)
}

export function searchTracks (list: Track[], query: string): Track[] {
  const q = query.trim().toLowerCase()
  if (q === '') return list
  return list.filter(track => {
    return `${track.title} ${track.artist}`.toLowerCase().includes(q)
  })
}
