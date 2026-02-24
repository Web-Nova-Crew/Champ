export interface FeatureFlag {
  key: string
  name: string
  description?: string
  enabled: boolean
  rollout?: number
  platforms: ('android' | 'ios' | 'web')[]
  createdAt: string
  updatedAt: string
}

export interface RemoteConfigItem {
  key: string
  value: string
  description?: string
  platform?: 'android' | 'ios' | 'web' | 'all'
  updatedAt: string
}

export interface AppVersionRule {
  platform: 'android' | 'ios'
  minVersion: string
  latestVersion: string
  forceUpdate: boolean
  updateMessage?: string
}

export interface PushTemplate {
  id: string
  title: string
  body: string
  topic?: string
  createdAt: string
}

export const mockFeatureFlags: FeatureFlag[] = [
  {
    key: 'enable_chat',
    name: 'In-App Chat',
    description: 'Enable chat between users and agents',
    enabled: true,
    rollout: 100,
    platforms: ['android', 'ios'],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z',
  },
  {
    key: 'new_home_ui',
    name: 'New Home UI',
    description: 'A/B test for new home screen layout',
    enabled: false,
    rollout: 10,
    platforms: ['android'],
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
]

export const mockRemoteConfig: RemoteConfigItem[] = [
  { key: 'primary_color', value: '#1D4ED8', description: 'Brand primary color', platform: 'all', updatedAt: '2026-01-01T00:00:00Z' },
  { key: 'home_banner_text', value: 'Find your dream home in Lucknow!', platform: 'android', updatedAt: '2026-01-10T00:00:00Z' },
  { key: 'support_whatsapp', value: '+91-90000-00000', platform: 'all', updatedAt: '2026-01-10T00:00:00Z' },
]

export const mockAppVersions: AppVersionRule[] = [
  { platform: 'android', minVersion: '1.0.0', latestVersion: '1.2.0', forceUpdate: false, updateMessage: 'We recommend updating for the best experience.' },
  { platform: 'ios', minVersion: '1.0.0', latestVersion: '1.1.0', forceUpdate: false, updateMessage: 'Bug fixes and performance improvements.' },
]

export const mockPushTemplates: PushTemplate[] = [
  { id: 'welcome', title: 'Welcome to Estato!', body: 'Thanks for joining us. Explore top properties now.', topic: 'all', createdAt: '2025-12-15T08:00:00Z' },
  { id: 'promo_jan', title: 'New Year Offers', body: 'Exclusive deals on premium listings this January!', topic: 'promotions', createdAt: '2026-01-01T08:00:00Z' },
]

