export interface PrimaryCheckConfig {
  disabled: boolean
  name: string
  value: number
  infoLink: string
}

export interface ChecksConfig {
  description: PrimaryCheckConfig
  supportFile: PrimaryCheckConfig
  topics: PrimaryCheckConfig & {
    requiredTopic: string[]
    topicCorrections: {
      [topic: string]: string
    }
  }
}

export interface AppConfig {
  threshold: number
  checks: ChecksConfig
}

export interface CheckResult {
  name: string
  passed: boolean
  score: number
  value: number
  infoLink: string
}

export interface AllCheckResults {
  checks: CheckResult[]
  score: number
  total: number
}
