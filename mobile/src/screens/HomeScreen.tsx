import React, { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native'
import { tracks } from '../data/tracks'
import { TrackList } from '../components/TrackList'
import { searchTracks, getTrending } from '../utils/filterTracks'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootStack'

export function HomeScreen ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => searchTracks(tracks, query), [query])
  const trending = useMemo(() => getTrending(tracks, 3), [])

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder='Search for music'
        placeholderTextColor='#9ca3af'
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />
      {query === '' && (
        <>
          <Text style={styles.heading}>Trending</Text>
          <TrackList
            tracks={trending}
            onSelect={(track) => { navigation.navigate('Track', { track }) }}
            scrollEnabled={false}
          />
        </>
      )}
      <Text style={styles.heading}>All Tracks</Text>
      <TrackList
        tracks={filtered}
        onSelect={(track) => { navigation.navigate('Track', { track }) }}
        scrollEnabled={false}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a'
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 8
  },
  search: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    color: '#e5e7eb'
  }
})
