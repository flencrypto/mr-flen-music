import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Mr FLEN Music',
  slug: 'mr-flen-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  assetBundlePatterns: ['**/*'],
  android: {
    package: 'com.mrflen.music'
  }
}

export default config
