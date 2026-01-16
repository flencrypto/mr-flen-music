/**
 * Storage Manager Screen - Manage storage and packs
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native'
import { storageManager, type StorageInfo } from '../../services/StorageManager'

export function StorageManagerScreen (): React.JSX.Element {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>(storageManager.getStorageInfo())
  const [autoCleanup, setAutoCleanup] = useState(false)

  useEffect(() => {
    // Refresh storage info periodically
    const interval = setInterval(() => {
      setStorageInfo(storageManager.getStorageInfo())
    }, 1000)

    return () => { clearInterval(interval) }
  }, [])

  const handleToggleFavourite = (packId: string, isFavourite: boolean): void => {
    storageManager.setPackFavourite(packId, !isFavourite)
    setStorageInfo(storageManager.getStorageInfo())
  }

  const handleDeletePack = (packId: string, isFavourite: boolean): void => {
    if (isFavourite) {
      Alert.alert(
        'Delete Favourite Pack',
        'This pack is marked as favourite. Are you sure you want to delete it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              storageManager.removePack(packId)
              setStorageInfo(storageManager.getStorageInfo())
            }
          }
        ]
      )
    } else {
      storageManager.removePack(packId)
      setStorageInfo(storageManager.getStorageInfo())
    }
  }

  const handleAutoCleanupToggle = (enabled: boolean): void => {
    setAutoCleanup(enabled)
    storageManager.setAutoCleanup(enabled)
  }

  const usagePercent = (storageInfo.usedBytes / storageInfo.maxBytes) * 100
  const isWarning = usagePercent >= 80

  const renderPack = ({ item }: { item: StorageInfo['packs'][0] }): React.JSX.Element => (
    <View style={styles.packCard}>
      <View style={styles.packHeader}>
        <Text style={styles.packName}>{item.packId}</Text>
        <TouchableOpacity onPress={() => { handleToggleFavourite(item.packId, item.isFavourite) }}>
          <Text style={styles.favouriteIcon}>{item.isFavourite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.packInfo}>
        <Text style={styles.packSize}>{Math.round(item.sizeBytes / (1024 * 1024))} MB</Text>
        <Text style={styles.packDate}>
          Installed {item.installedAt.toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => { handleDeletePack(item.packId, item.isFavourite) }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.storageOverview}>
        <Text style={styles.title}>Storage Usage</Text>
        <View style={styles.storageBar}>
          <View
            style={[
              styles.storageBarFill,
              { width: `${Math.min(usagePercent, 100)}%` },
              isWarning && styles.storageBarWarning
            ]}
          />
        </View>
        <View style={styles.storageStats}>
          <Text style={styles.storageText}>
            {Math.round(storageInfo.usedBytes / (1024 * 1024))} MB used
          </Text>
          <Text style={styles.storageText}>
            {Math.round(storageInfo.maxBytes / (1024 * 1024))} MB total
          </Text>
        </View>
        {isWarning && (
          <Text style={styles.warningText}>⚠️ Storage is at {Math.round(usagePercent)}%</Text>
        )}
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Auto Cleanup</Text>
            <Text style={styles.settingDescription}>
              Automatically remove least-used packs when storage is full
            </Text>
          </View>
          <Switch value={autoCleanup} onValueChange={handleAutoCleanupToggle} />
        </View>
      </View>

      <View style={styles.packsSection}>
        <Text style={styles.sectionTitle}>Installed Packs ({storageInfo.packs.length})</Text>
        {storageInfo.packs.length === 0 ? (
          <Text style={styles.emptyText}>No packs installed</Text>
        ) : (
          <FlatList
            data={storageInfo.packs}
            renderItem={renderPack}
            keyExtractor={(item) => item.packId}
            contentContainerStyle={styles.packsList}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  storageOverview: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  storageBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6
  },
  storageBarWarning: {
    backgroundColor: '#FF9500'
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  storageText: {
    fontSize: 14,
    color: '#666'
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600'
  },
  settingsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    maxWidth: '80%'
  },
  packsSection: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20
  },
  packsList: {
    paddingBottom: 16
  },
  packCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  packName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  favouriteIcon: {
    fontSize: 24,
    color: '#FFD700'
  },
  packInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  packSize: {
    fontSize: 14,
    color: '#666'
  },
  packDate: {
    fontSize: 14,
    color: '#999'
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
})
