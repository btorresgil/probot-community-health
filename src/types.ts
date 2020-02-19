export interface PrimaryCheckConfig {
  disabled: boolean
  name: string
  value: number
  infoLink: string
}

export interface ChecksConfig {
  description: PrimaryCheckConfig
  readmeFile: PrimaryCheckConfig
  supportFile: PrimaryCheckConfig
  repoName: PrimaryCheckConfig
  contributingFile: PrimaryCheckConfig
  topics: PrimaryCheckConfig & {
    requiredTopic: string[]
    topicCorrections: {
      [topic: string]: string
    }
  }
  customTemplates: PrimaryCheckConfig
  codeOfConductFile: PrimaryCheckConfig
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
  skipped?: boolean
}

export interface AllCheckResults {
  checks: CheckResult[]
  score: number
  total: number
}
