export interface PrimaryCheckConfig {
  disabled?: boolean
  name?: string
  value?: number
  infoLink?: string
}
export interface AppConfig {
  threshold?: number
  checks?: {
    topics?: PrimaryCheckConfig & {
      requiredTopic?: string[]
      topicCorrections?: {
        [topic: string]: string
      }
    }
  }
}

export interface DefaultPrimaryCheckConfig {
  disabled: boolean
  name: string
  value: number
  infoLink: string
}
export interface DefaultAppConfig {
  threshold: number
  checks: {
    topics: DefaultPrimaryCheckConfig & {
      requiredTopic: string[]
      topicCorrections: {
        [topic: string]: string
      }
    }
  }
}

export const defaults: DefaultAppConfig = {
  threshold: 80,
  checks: {
    topics: {
      disabled: false,
      name: 'Required topics attached to repo',
      value: 10,
      infoLink: 'https://github.com',
      requiredTopic: [],
      topicCorrections: {},
    },
  },
}
