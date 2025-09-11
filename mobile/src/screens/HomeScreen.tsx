import React from 'react'
import { View } from 'react-native'
import { tracks } from '../data/tracks'
import { TrackList } from '../components/TrackList'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootStack'

export function HomeScreen ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>): React.JSX.Element {
  return (
    <View>
      <TrackList tracks={tracks} onSelect={(track) => { navigation.navigate('Track', { track }) }} />
    </View>
  )
}
