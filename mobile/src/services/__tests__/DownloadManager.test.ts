/**
 * Tests for DownloadManager state machine
 */

import { DownloadManager } from '../DownloadManager'
import { PackInstallState } from '../../types/pack'

describe('DownloadManager', () => {
  let manager: DownloadManager

  beforeEach(() => {
    manager = new DownloadManager()
  })

  describe('State Machine', () => {
    it('should queue a download', () => {
      manager.queueDownload('test_pack', 1, 1000000)
      const state = manager.getPackState('test_pack')
      expect(state?.state).toBe(PackInstallState.QUEUED)
    })

    it('should pause a downloading pack', (done) => {
      manager.queueDownload('test_pack', 1, 1000000)

      manager.onStateChange((packId, state) => {
        if (state === PackInstallState.DOWNLOADING) {
          manager.pauseDownload('test_pack')
          const packState = manager.getPackState('test_pack')
          expect(packState?.state).toBe(PackInstallState.PAUSED)
          done()
        }
      })
    })

    it('should resume a paused pack', () => {
      manager.queueDownload('test_pack', 1, 1000000)
      manager.pauseDownload('test_pack')
      manager.resumeDownload('test_pack')

      const state = manager.getPackState('test_pack')
      expect(state?.state).toBe(PackInstallState.QUEUED)
    })

    it('should cancel a download', () => {
      manager.queueDownload('test_pack', 1, 1000000)
      manager.cancelDownload('test_pack')

      const state = manager.getPackState('test_pack')
      expect(state).toBeUndefined()
    })

    it('should retry a failed download', (done) => {
      manager.queueDownload('test_pack', 1, 1000000)

      manager.onStateChange((packId, state) => {
        if (state === PackInstallState.FAILED) {
          manager.retryDownload('test_pack')
          const packState = manager.getPackState('test_pack')
          expect(packState?.state).toBe(PackInstallState.QUEUED)
          done()
        }
      })
    })

    it('should track download progress', (done) => {
      manager.queueDownload('test_pack', 1, 1000000)

      let progressCalled = false
      manager.onProgress((packId, progress) => {
        if (packId === 'test_pack' && progress > 0) {
          progressCalled = true
        }
      })

      manager.onStateChange((packId, state) => {
        if (state === PackInstallState.INSTALLED) {
          expect(progressCalled).toBe(true)
          done()
        }
      })
    })

    it('should respect max concurrent downloads', () => {
      manager.queueDownload('pack1', 1, 1000000)
      manager.queueDownload('pack2', 1, 1000000)
      manager.queueDownload('pack3', 1, 1000000)

      const active = manager.getActiveDownloads()
      expect(active.length).toBe(3)

      const downloading = active.filter(d => d.state === PackInstallState.DOWNLOADING)
      expect(downloading.length).toBeLessThanOrEqual(2)
    })
  })

  describe('State Transitions', () => {
    it('should transition through states correctly', (done) => {
      const states: PackInstallState[] = []

      manager.onStateChange((packId, state) => {
        if (packId === 'test_pack') {
          states.push(state)

          if (state === PackInstallState.INSTALLED) {
            expect(states).toContain(PackInstallState.QUEUED)
            expect(states).toContain(PackInstallState.DOWNLOADING)
            expect(states).toContain(PackInstallState.VERIFYING)
            expect(states).toContain(PackInstallState.INSTALLED)
            done()
          }
        }
      })

      manager.queueDownload('test_pack', 1, 1000000)
    })
  })
})
