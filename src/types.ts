export interface PrimaryCheckConfig {
  disabled: boolean
  name: string
  value: number
  infoLink: string
}

export interface ChecksConfig {
  description: PrimaryCheckConfig
  readmeFile: PrimaryCheckConfig & {
    size: number
  }
  supportFile: PrimaryCheckConfig & {
    size: number
  }
  repoName: PrimaryCheckConfig & {
    length: number
  }
  contributingFile: PrimaryCheckConfig & {
    size: number
  }
  topics: PrimaryCheckConfig & {
    requiredTopic: string[]
    topicCorrections: {
      [topic: string]: string[]
    }
  }
  customTemplates: PrimaryCheckConfig
  codeOfConductFile: PrimaryCheckConfig & {
    size: number
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
  skipped?: boolean
}

export interface AllCheckResults {
  checks: CheckResult[]
  score: number
  total: number
  threshold: number
}
