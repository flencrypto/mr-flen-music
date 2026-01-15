/**
 * Music Home Screen - Featured packs and recommendations
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Switch } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootStack'
import { packCatalog } from '../../data/packCatalog'
import type { PackCatalogItem } from '../../types/pack'
import { downloadManager } from '../../services/DownloadManager'
import { PackInstallState } from '../../types/pack'

type Props = NativeStackScreenProps<RootStackParamList, 'MusicHome'>

export function MusicHomeScreen ({ navigation }: Props): React.JSX.Element {
  const [useMusicInSessions, setUseMusicInSessions] = useState(true)
  const [packStates, setPackStates] = useState<Map<string, PackInstallState>>(new Map())

  useEffect(() => {
    // Subscribe to download state changes
    downloadManager.onStateChange((packId, state) => {
      setPackStates(prev => new Map(prev).set(packId, state))
    })
  }, [])

  const getPackState = (packId: string): PackInstallState => {
    return packStates.get(packId) ?? PackInstallState.NOT_INSTALLED
  }

  const renderPack = ({ item }: { item: PackCatalogItem }): React.JSX.Element => {
    const state = getPackState(item.packId)
    const isInstalled = state === PackInstallState.INSTALLED

    return (
      <TouchableOpacity
        style={styles.packCard}
        onPress={() => { navigation.navigate('PackDetail', { pack: item }) }}
      >
        <Image source={{ uri: item.coverUrl }} style={styles.packArt} />
        <View style={styles.packInfo}>
          <Text style={styles.packName}>{item.name}</Text>
          <Text style={styles.packDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.packMeta}>
            <Text style={styles.metaText}>
              {Math.round(item.totalSeconds / 60)} min
            </Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>
              {Math.round(item.sizeBytes / (1024 * 1024))} MB
            </Text>
            {isInstalled && <Text style={styles.installedBadge}>✓ Downloaded</Text>}
          </View>
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map(tag => (
              <Text key={tag} style={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const featuredPack = packCatalog[0]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Music Packs</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Use music in sessions</Text>
          <Switch
            value={useMusicInSessions}
            onValueChange={setUseMusicInSessions}
          />
        </View>
      </View>

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Pack</Text>
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => { navigation.navigate('PackDetail', { pack: featuredPack }) }}
        >
          <Image source={{ uri: featuredPack.coverUrl }} style={styles.featuredArt} />
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredName}>{featuredPack.name}</Text>
            <Text style={styles.featuredDescription}>{featuredPack.description}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.allPacksSection}>
        <Text style={styles.sectionTitle}>All Packs</Text>
        <FlatList
          data={packCatalog}
          renderItem={renderPack}
          keyExtractor={(item) => item.packId}
          contentContainerStyle={styles.packList}
        />
      </View>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333'
  },
  featuredSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  featuredArt: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  featuredInfo: {
    flex: 1,
    marginLeft: 12
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666'
  },
  allPacksSection: {
    flex: 1,
    padding: 16
  },
  packList: {
    paddingBottom: 16
  },
  packCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start'
  },
  packArt: {
    width: 64,
    height: 64,
    borderRadius: 6
  },
  packInfo: {
    flex: 1,
    marginLeft: 12
  },
  packName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  packDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8
  },
  packMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginRight: 8
  },
  installedBadge: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600'
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4
  }
})
