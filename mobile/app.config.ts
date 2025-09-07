import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Mr.FLEN Music',
  slug: 'mr-flen-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['android']
})
