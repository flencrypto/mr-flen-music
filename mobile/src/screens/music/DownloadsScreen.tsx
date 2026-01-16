/**
 * Downloads Screen - Shows active downloads with controls
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import type { PackInstall } from '../../types/pack'
import { PackInstallState } from '../../types/pack'
import { downloadManager } from '../../services/DownloadManager'

export function DownloadsScreen (): React.JSX.Element {
  const [activeDownloads, setActiveDownloads] = useState<PackInstall[]>([])

  useEffect(() => {
    const updateDownloads = (): void => {
      setActiveDownloads(downloadManager.getActiveDownloads())
    }

    downloadManager.onStateChange(updateDownloads)
    downloadManager.onProgress(updateDownloads)

    updateDownloads()
  }, [])

  const handlePauseResume = (packId: string, state: PackInstallState): void => {
    if (state === PackInstallState.DOWNLOADING) {
      downloadManager.pauseDownload(packId)
    } else if (state === PackInstallState.PAUSED) {
      downloadManager.resumeDownload(packId)
    }
  }

  const handleCancel = (packId: string): void => {
    downloadManager.cancelDownload(packId)
  }

  const handleRetry = (packId: string): void => {
    downloadManager.retryDownload(packId)
  }

  const renderDownload = ({ item }: { item: PackInstall }): React.JSX.Element => {
    const progress = item.totalBytes > 0 ? item.bytesDownloaded / item.totalBytes : 0

    return (
      <View style={styles.downloadCard}>
        <View style={styles.downloadHeader}>
          <Text style={styles.packName}>{item.packId}</Text>
          <Text style={styles.stateText}>{item.state}</Text>
        </View>

        {(item.state === PackInstallState.DOWNLOADING || item.state === PackInstallState.VERIFYING) && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}

        <View style={styles.downloadInfo}>
          <Text style={styles.infoText}>
            {Math.round(item.bytesDownloaded / (1024 * 1024))} / {Math.round(item.totalBytes / (1024 * 1024))} MB
          </Text>
          {item.state !== PackInstallState.VERIFYING && (
            <Text style={styles.infoText}>{Math.round(progress * 100)}%</Text>
          )}
        </View>

        <View style={styles.actions}>
          {(item.state === PackInstallState.DOWNLOADING || item.state === PackInstallState.PAUSED) && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => { handlePauseResume(item.packId, item.state) }}
              >
                <Text style={styles.actionButtonText}>
                  {item.state === PackInstallState.DOWNLOADING ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => { handleCancel(item.packId) }}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {item.state === PackInstallState.FAILED && (
            <TouchableOpacity
              style={[styles.actionButton, styles.retryButton]}
              onPress={() => { handleRetry(item.packId) }}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          )}

          {item.error != null && (
            <Text style={styles.errorText}>{item.error}</Text>
          )}
        </View>
      </View>
    )
  }

  if (activeDownloads.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active downloads</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeDownloads}
        renderItem={renderDownload}
        keyExtractor={(item) => item.packId}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  list: {
    padding: 16
  },
  downloadCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  packName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  stateText: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize'
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
  downloadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  infoText: {
    fontSize: 13,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#FF3B30'
  },
  retryButton: {
    backgroundColor: '#34C759'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 8
  }
})
