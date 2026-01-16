/**
 * Pack Detail Screen - Shows tracks, size, and download controls
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/RootStack'
import type { Track } from '../../types/pack'
import { PackInstallState } from '../../types/pack'
import { downloadManager } from '../../services/DownloadManager'
import { sampleManifest } from '../../data/packCatalog'

type Props = NativeStackScreenProps<RootStackParamList, 'PackDetail'>

export function PackDetailScreen ({ route }: Props): React.JSX.Element {
  const { pack } = route.params
  const [downloadState, setDownloadState] = useState<PackInstallState>(PackInstallState.NOT_INSTALLED)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    // Subscribe to download updates
    downloadManager.onStateChange((packId, state) => {
      if (packId === pack.packId) {
        setDownloadState(state)
      }
    })

    downloadManager.onProgress((packId, progress) => {
      if (packId === pack.packId) {
        setDownloadProgress(progress)
      }
    })

    // Check current state
    const current = downloadManager.getPackState(pack.packId)
    if (current != null) {
      setDownloadState(current.state)
      setDownloadProgress(current.bytesDownloaded / current.totalBytes)
    }
  }, [pack.packId])

  const handleDownload = (): void => {
    if (downloadState === PackInstallState.NOT_INSTALLED || downloadState === PackInstallState.FAILED) {
      downloadManager.queueDownload(pack.packId, pack.latestVersion, pack.sizeBytes)
    } else if (downloadState === PackInstallState.DOWNLOADING) {
      downloadManager.pauseDownload(pack.packId)
    } else if (downloadState === PackInstallState.PAUSED) {
      downloadManager.resumeDownload(pack.packId)
    }
  }

  const handleCancel = (): void => {
    downloadManager.cancelDownload(pack.packId)
  }

  const renderDownloadButton = (): React.JSX.Element => {
    if (downloadState === PackInstallState.INSTALLED) {
      return (
        <View style={styles.installedButton}>
          <Text style={styles.installedButtonText}>✓ Downloaded</Text>
        </View>
      )
    }

    if (downloadState === PackInstallState.DOWNLOADING || downloadState === PackInstallState.VERIFYING) {
      return (
        <View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${downloadProgress * 100}%` }]} />
          </View>
          <View style={styles.downloadActions}>
            <TouchableOpacity style={styles.pauseButton} onPress={handleDownload}>
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.progressText}>
            {downloadState === PackInstallState.VERIFYING
              ? 'Verifying...'
              : `${Math.round(downloadProgress * 100)}%`}
          </Text>
        </View>
      )
    }

    if (downloadState === PackInstallState.PAUSED) {
      return (
        <View style={styles.downloadActions}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (downloadState === PackInstallState.FAILED) {
      return (
        <TouchableOpacity style={styles.retryButton} onPress={handleDownload}>
          <Text style={styles.buttonText}>Retry Download</Text>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Text style={styles.buttonText}>Download Pack</Text>
      </TouchableOpacity>
    )
  }

  const renderTrack = ({ item, index }: { item: Track, index: number }): React.JSX.Element => (
    <View style={styles.trackRow}>
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <View style={styles.trackMeta}>
          <Text style={styles.bpmBadge}>{item.bpm} BPM</Text>
          <Text style={styles.energyBadge}>Energy: {item.energy}/5</Text>
          <Text style={styles.duration}>{Math.floor(item.durationSec / 60)}:{(item.durationSec % 60).toString().padStart(2, '0')}</Text>
        </View>
      </View>
    </View>
  )

  // Use sample manifest tracks for display
  const tracks = sampleManifest.tracks

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: pack.coverUrl }} style={styles.packArt} />
        <View style={styles.headerInfo}>
          <Text style={styles.packName}>{pack.name}</Text>
          <Text style={styles.packDescription}>{pack.description}</Text>
          <View style={styles.packMeta}>
            <Text style={styles.metaText}>{Math.round(pack.totalSeconds / 60)} minutes</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{Math.round(pack.sizeBytes / (1024 * 1024))} MB</Text>
          </View>
        </View>
      </View>

      <View style={styles.downloadSection}>
        {renderDownloadButton()}
      </View>

      <View style={styles.trackListSection}>
        <Text style={styles.sectionTitle}>Tracks ({tracks.length})</Text>
        <FlatList
          data={tracks}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.trackList}
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  packArt: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center'
  },
  packName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  packDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  packMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaText: {
    fontSize: 13,
    color: '#999',
    marginRight: 8
  },
  downloadSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  retryButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  installedButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  installedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  downloadActions: {
    flexDirection: 'row'
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666'
  },
  trackListSection: {
    flex: 1,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  trackList: {
    paddingBottom: 16
  },
  trackRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center'
  },
  trackNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    width: 30
  },
  trackInfo: {
    flex: 1
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bpmBadge: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8
  },
  energyBadge: {
    fontSize: 12,
    color: '#FF9500',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8
  },
  duration: {
    fontSize: 12,
    color: '#999'
  }
})
