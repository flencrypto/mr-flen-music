import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { tracks } from '../data/tracks'
import { TrackList } from '../components/TrackList'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootStack'

export function HomeScreen ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mr.FLEN Music</Text>
        <TouchableOpacity
          style={styles.musicButton}
          onPress={() => { navigation.navigate('MusicHome') }}
        >
          <Text style={styles.musicButtonText}>🎵 Music Packs</Text>
        </TouchableOpacity>
      </View>
      <TrackList tracks={tracks} onSelect={(track) => { navigation.navigate('Track', { track }) }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12
  },
  musicButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  musicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
