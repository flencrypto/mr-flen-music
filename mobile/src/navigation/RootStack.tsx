import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { HomeScreen } from '../screens/HomeScreen'
import { TrackScreen } from '../screens/TrackScreen'
import type { Track } from '../data/tracks'

export interface RootStackParamList extends Record<string, object | undefined> {
  Home: undefined
  Track: { track: Track }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootStack (): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen
          name='Track'
          component={TrackScreen}
          options={({ route }) => ({ title: route.params.track.title })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
