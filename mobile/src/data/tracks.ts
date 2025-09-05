export interface Track {
  id: string
  title: string
  artist: string
  artwork: string
  plays: number
}

export const tracks: Track[] = [
  {
    id: '1',
    title: 'Warm Intro',
    artist: 'Mr.FLEN',
    artwork: 'https://placekitten.com/200/200',
    plays: 150
  },
  {
    id: '2',
    title: 'Night Drive',
    artist: 'Mr.FLEN',
    artwork: 'https://placekitten.com/201/201',
    plays: 300
  },
  {
    id: '3',
    title: 'Sunrise',
    artist: 'DJ Test',
    artwork: 'https://placekitten.com/202/202',
    plays: 75
  }
]
