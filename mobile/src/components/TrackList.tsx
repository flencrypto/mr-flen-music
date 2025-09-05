import React from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Track } from '../data/tracks'

export interface TrackListProps {
  tracks: Track[]
  onSelect: (track: Track) => void
}

export function TrackList ({ tracks, onSelect }: TrackListProps): JSX.Element {
  return (
    <FlatList
      data={tracks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => { onSelect(item) }}>
          <Image source={{ uri: item.artwork }} style={styles.art} />
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.artist}>{item.artist}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 12
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb'
  },
  artist: {
    fontSize: 12,
    color: '#9ca3af'
  }
})
