import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeScreen } from '../screens/HomeScreen'
import { TrackScreen } from '../screens/TrackScreen'
import { MusicHomeScreen } from '../screens/music/MusicHomeScreen'
import { PackDetailScreen } from '../screens/music/PackDetailScreen'
import { DownloadsScreen } from '../screens/music/DownloadsScreen'
import { StorageManagerScreen } from '../screens/music/StorageManagerScreen'
import type { Track } from '../data/tracks'
import type { PackCatalogItem } from '../types/pack'

export interface RootStackParamList extends Record<string, object | undefined> {
  Home: undefined
  Track: { track: Track }
  MusicHome: undefined
  PackDetail: { pack: PackCatalogItem }
  Downloads: undefined
  StorageManager: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootStack (): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen
          name='Track'
          component={TrackScreen}
          options={({ route }) => ({ title: route.params.track.title })}
        />
        <Stack.Screen 
          name='MusicHome' 
          component={MusicHomeScreen}
          options={{ title: 'Music Packs' }}
        />
        <Stack.Screen
          name='PackDetail'
          component={PackDetailScreen}
          options={({ route }) => ({ title: route.params.pack.name })}
        />
        <Stack.Screen
          name='Downloads'
          component={DownloadsScreen}
          options={{ title: 'Downloads' }}
        />
        <Stack.Screen
          name='StorageManager'
          component={StorageManagerScreen}
          options={{ title: 'Storage' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
