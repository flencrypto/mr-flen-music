import React, { useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { tracks } from '../data/tracks'
import { TrackList } from '../components/TrackList'
import { searchTracks } from '../utils/filterTracks'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootStack'

export function HomeScreen ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element {
  const [query, setQuery] = useState('')
  const filtered = searchTracks(tracks, query)

  return (
    <View style={styles.container}>
      <TextInput
        placeholder='Search for music'
        placeholderTextColor='#9ca3af'
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />
      <TrackList tracks={filtered} onSelect={(track) => { navigation.navigate('Track', { track }) }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a'
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
