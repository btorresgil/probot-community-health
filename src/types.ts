export interface AppInfo {
  appName: string
  appUrl: string
  appSlug: string
}

export interface PrimaryCheckConfig {
  id?: CheckId
  disabled: boolean
  name: string
  value: number
  infoLink: string
}

export type DescriptionConfig = PrimaryCheckConfig
export type ReadmeFileConfig = PrimaryCheckConfig & { size: number }
export type LicenseFileConfig = PrimaryCheckConfig
export type LicenseConfig = PrimaryCheckConfig & { licenses: string[] | null }
export type SupportFileConfig = PrimaryCheckConfig & { size: number }
export type RepoNameConfig = PrimaryCheckConfig & { length: number }
export type ContributingFileConfig = PrimaryCheckConfig & { size: number }
export type TopicsConfig = PrimaryCheckConfig & {
  requiredTopic: string[]
  topicCorrections: {
    [topic: string]: string[]
  }
}
export type CustomTemplatesConfig = PrimaryCheckConfig
export type CodeOfConductFileConfig = PrimaryCheckConfig & { size: number }

export type AnyCheckConfig =
  | DescriptionConfig
  | ReadmeFileConfig
  | LicenseFileConfig
  | LicenseConfig
  | SupportFileConfig
  | RepoNameConfig
  | ContributingFileConfig
  | TopicsConfig
  | CustomTemplatesConfig
  | CodeOfConductFileConfig

export type CheckId =
  | 'description'
  | 'readmeFile'
  | 'licenseFile'
  | 'license'
  | 'supportFile'
  | 'repoName'
  | 'contributingFile'
  | 'topics'
  | 'customTemplates'
  | 'codeOfConductFile'

export interface ChecksConfig {
  description: DescriptionConfig
  readmeFile: ReadmeFileConfig
  licenseFile: LicenseFileConfig
  license: LicenseConfig
  supportFile: SupportFileConfig
  repoName: RepoNameConfig
  contributingFile: ContributingFileConfig
  topics: TopicsConfig
  customTemplates: CustomTemplatesConfig
  codeOfConductFile: CodeOfConductFileConfig
}

export interface AppConfig {
  threshold: number
  checks: ChecksConfig
}

export interface CheckResult {
  id: CheckId
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

export interface CheckState {
  id: CheckId
  passed: boolean
  score: number
  skipped?: boolean
}

export interface State {
  checks: CheckState[]
  score: number
  threshold: number
}

export type CheckStateIndex = { [id in CheckId]: CheckState }
