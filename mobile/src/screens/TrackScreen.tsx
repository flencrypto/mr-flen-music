import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootStack'

export function TrackScreen ({ route }: NativeStackScreenProps<RootStackParamList, 'Track'>): React.JSX.Element {
  const { track } = route.params
  return (
    <View style={styles.container}>
      <Image source={{ uri: track.artwork }} style={styles.art} />
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.artist}>{track.artist}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  art: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  artist: {
    fontSize: 16,
    color: '#666'
  }
})
