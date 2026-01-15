/**
 * Tests for StorageManager
 */

import { StorageManager } from '../StorageManager'
import { PackInstallState, type PackInstall } from '../../types/pack'

describe('StorageManager', () => {
  let manager: StorageManager

  beforeEach(() => {
    manager = new StorageManager()
  })

  describe('Storage Tracking', () => {
    it('should track installed packs', () => {
      const pack: PackInstall = {
        packId: 'test_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 1000000,
        totalBytes: 1000000,
        installedAt: new Date(),
        path: 'packs/test_pack_1'
      }

      manager.addInstalledPack(pack)
      const info = manager.getStorageInfo()

      expect(info.packs.length).toBe(1)
      expect(info.usedBytes).toBe(1000000)
    })

    it('should check if there is space for download', () => {
      const largeSize = 2 * 1024 * 1024 * 1024 // 2GB

      expect(manager.hasSpaceFor(largeSize)).toBe(false)
      expect(manager.hasSpaceFor(100 * 1024 * 1024)).toBe(true) // 100MB
    })

    it('should detect storage warning threshold', () => {
      // Add packs to exceed 80% threshold
      const packSize = 200 * 1024 * 1024 // 200MB each

      for (let i = 0; i < 5; i++) {
        const pack: PackInstall = {
          packId: `pack_${i}`,
          version: 1,
          state: PackInstallState.INSTALLED,
          bytesDownloaded: packSize,
          totalBytes: packSize,
          installedAt: new Date(),
          path: `packs/pack_${i}_1`
        }
        manager.addInstalledPack(pack)
      }

      expect(manager.isStorageWarning()).toBe(true)
    })

    it('should remove a pack and its tracks', () => {
      const pack: PackInstall = {
        packId: 'test_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 1000000,
        totalBytes: 1000000,
        installedAt: new Date(),
        path: 'packs/test_pack_1'
      }

      manager.addInstalledPack(pack)
      manager.removePack('test_pack')

      const info = manager.getStorageInfo()
      expect(info.packs.length).toBe(0)
    })
  })

  describe('Favourites', () => {
    it('should mark pack as favourite', () => {
      const pack: PackInstall = {
        packId: 'test_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 1000000,
        totalBytes: 1000000,
        installedAt: new Date()
      }

      manager.addInstalledPack(pack)
      manager.setPackFavourite('test_pack', true)

      expect(manager.isPackFavourite('test_pack')).toBe(true)

      const info = manager.getStorageInfo()
      expect(info.packs[0].isFavourite).toBe(true)
    })

    it('should protect favourites from auto-cleanup', () => {
      manager.setAutoCleanup(true)

      // Add a favourite pack
      const favPack: PackInstall = {
        packId: 'fav_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 500 * 1024 * 1024,
        totalBytes: 500 * 1024 * 1024,
        installedAt: new Date(Date.now() - 86400000) // 1 day ago
      }
      manager.addInstalledPack(favPack)
      manager.setPackFavourite('fav_pack', true)

      // Add a regular pack
      const regularPack: PackInstall = {
        packId: 'regular_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 500 * 1024 * 1024,
        totalBytes: 500 * 1024 * 1024,
        installedAt: new Date()
      }
      manager.addInstalledPack(regularPack)

      // Try to free space
      const removed = manager.autoCleanup(100 * 1024 * 1024)

      expect(removed).not.toContain('fav_pack')
      expect(manager.isPackFavourite('fav_pack')).toBe(true)
    })
  })

  describe('Auto Cleanup', () => {
    it('should remove oldest non-favourite packs first', () => {
      manager.setAutoCleanup(true)

      const oldPack: PackInstall = {
        packId: 'old_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 500 * 1024 * 1024,
        totalBytes: 500 * 1024 * 1024,
        installedAt: new Date(Date.now() - 7 * 86400000) // 7 days ago
      }
      manager.addInstalledPack(oldPack)

      const newPack: PackInstall = {
        packId: 'new_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 500 * 1024 * 1024,
        totalBytes: 500 * 1024 * 1024,
        installedAt: new Date()
      }
      manager.addInstalledPack(newPack)

      const removed = manager.autoCleanup(100 * 1024 * 1024)

      expect(removed).toContain('old_pack')
      expect(removed).not.toContain('new_pack')
    })

    it('should not cleanup when disabled', () => {
      manager.setAutoCleanup(false)

      const pack: PackInstall = {
        packId: 'test_pack',
        version: 1,
        state: PackInstallState.INSTALLED,
        bytesDownloaded: 500 * 1024 * 1024,
        totalBytes: 500 * 1024 * 1024,
        installedAt: new Date()
      }
      manager.addInstalledPack(pack)

      const removed = manager.autoCleanup(1024 * 1024 * 1024)
      expect(removed.length).toBe(0)
    })
  })
})
