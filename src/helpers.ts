import { Application, Context, Octokit } from 'probot'
import metadata from 'probot-metadata'
import R from 'ramda'

import {
  PrimaryCheckConfig,
  CheckResult,
  AllCheckResults,
  State,
  AnyCheckConfig,
  AppConfig,
  CheckId,
  DescriptionConfig,
  ReadmeFileConfig,
  LicenseFileConfig,
  SupportFileConfig,
  LicenseConfig,
  RepoNameConfig,
  ContributingFileConfig,
  TopicsConfig,
  CustomTemplatesConfig,
  CodeOfConductFileConfig,
  CheckStateIndex,
} from './types'
import { checkStatus, issueMessage } from './messages'

export async function fetchAppInfo(
  app: Application,
): Promise<{ appName: string; appUrl: string; appSlug: string }> {
  const appGh = await app.auth()
  const { name: appName, html_url: appUrl, slug: appSlug } = (
    await appGh.apps.getAuthenticated()
  ).data
  return { appName, appUrl, appSlug }
}

export async function refreshRepo(
  context: Context,
): Promise<Octokit.ReposGetResponse> {
  try {
    const response = await context.github.repos.get(context.repo())
    return response.data
  } catch (err) {
    context.log.error(
      `Can't refresh repo details: ${JSON.stringify(context.repo())}`,
    )
    context.log.error(`Error details: ${JSON.stringify(err)}`)
    throw err
  }
}

export function isActivePublicRepo(context: Context): boolean {
  const repo = context.payload.repository
  if (repo.private || repo.fork || repo.archived || repo.disabled) {
    return false
  } else {
    return true
  }
}

export function sortResultsByValue(results: AllCheckResults): AllCheckResults {
  const byValueDesc = (a: CheckResult, b: CheckResult) => b.value - a.value
  const sortedChecks = R.sort(byValueDesc, results.checks)
  return { ...results, ...{ checks: sortedChecks } }
}

export function getConfig(
  id: 'description',
  config: AppConfig,
): DescriptionConfig
export function getConfig(id: 'readmeFile', config: AppConfig): ReadmeFileConfig
export function getConfig(
  id: 'licenseFile',
  config: AppConfig,
): LicenseFileConfig
export function getConfig(id: 'license', config: AppConfig): LicenseConfig
export function getConfig(
  id: 'supportFile',
  config: AppConfig,
): SupportFileConfig
export function getConfig(id: 'repoName', config: AppConfig): RepoNameConfig
export function getConfig(
  id: 'contributingFile',
  config: AppConfig,
): ContributingFileConfig
export function getConfig(id: 'topics', config: AppConfig): TopicsConfig
export function getConfig(
  id: 'customTemplates',
  config: AppConfig,
): CustomTemplatesConfig
export function getConfig(
  id: 'codeOfConductFile',
  config: AppConfig,
): CodeOfConductFileConfig
export function getConfig(id: CheckId, config: AppConfig): AnyCheckConfig {
  const checkConfig = config.checks[id]
  return { ...checkConfig, id }
}

export function result(
  config: PrimaryCheckConfig,
  passed?: boolean,
): CheckResult {
  const skipped = passed === undefined
  return {
    id: config.id || 'description',
    passed: passed || false,
    name: config.name,
    value: config.value,
    infoLink: config.infoLink,
    score: passed ? config.value : 0,
    skipped,
  }
}

export async function fetchRepoTopics(
  context: Context<any>,
): Promise<string[]> {
  try {
    const topicsResponse = await context.github.repos.listTopics(context.repo())
    return topicsResponse.data.names
  } catch (err) {
    context.log.error(`Can't fetch topics: ${JSON.stringify(context.repo())}`)
    context.log.error(`Error details: ${JSON.stringify(err)}`)
    throw err
  }
}

export async function fetchFile(
  context: Context<any>,
  filePath: string,
): Promise<{
  name: string
  path: string
  size: number
  content: string
} | null> {
  let file
  try {
    file = await context.github.repos.getContents({
      ...context.repo(),
      path: filePath,
    })
  } catch (err) {
    if (err.name === 'HttpError' && err.status === 404) return null
    throw err
  }
  if (
    !Array.isArray(file.data) &&
    file.data.type === 'file' &&
    file.data.content
  ) {
    return {
      name: file.data.name,
      path: file.data.path,
      size: file.data.size,
      content: file.data.content || '',
    }
  } else {
    return null
  }
}

export async function fetchDirectory(
  context: Context<any>,
  dirPath: string,
): Promise<string[] | null> {
  let dir: Octokit.Response<Octokit.ReposGetContentsResponse>
  try {
    dir = await context.github.repos.getContents({
      ...context.repo(),
      path: dirPath,
    })
  } catch (err) {
    if (err.name === 'HttpError' && err.status === 404) return null
    throw err
  }
  if (Array.isArray(dir.data)) {
    return dir.data.map((item) => item.name)
  } else {
    return null
  }
}

export async function issueTemplateExists(
  context: Context<any>,
): Promise<boolean> {
  const issueFile = await fetchFile(context, '.github/ISSUE_TEMPLATE.md')
  if (issueFile !== null) return true
  const issueDir = await fetchDirectory(context, '.github/ISSUE_TEMPLATE')
  if (issueDir !== null && issueDir.length > 0) return true
  return false
}

export function generateState(results: AllCheckResults): State {
  const pickCheckFields = R.pick(['id', 'passed', 'score', 'skipped'])
  const { score, threshold, checks } = results
  return { score, threshold, checks: checks.map(pickCheckFields) }
}

export function fetchPreviousState(
  context: Context<any>,
  issue?: any,
): Promise<State | undefined> {
  return metadata(context, issue).get('state')
}

export function setState(
  state: State | AllCheckResults,
  context: Context<any>,
  issue?: any,
): Promise<Octokit.IssuesUpdateResponse> {
  if ('total' in state) {
    const newState = generateState(state)
    return metadata(context, issue).set('state', newState)
  }
  return metadata(context, issue).set('state', state)
}

/**
 * Switch from key: value[] to value: key for each value in value array
 *
 * This makes it possible to easily convert bad topics to good when good
 * is the key and bad is an array under that key.
 *
 */
export function transposeTopicCorrections(topicCorrections: {
  [goodTopic: string]: string[]
}): { [badTopic: string]: string } {
  return Object.entries(topicCorrections).reduce((acc, topicPair) => {
    const result = topicPair[1].reduce(
      (acc2, badTopic) => ({ ...acc2, [badTopic]: topicPair[0] }),
      {},
    )
    return result
  }, {})
}

export function changesMessage(
  results: AllCheckResults,
  previousState: State,
): string {
  // Organize into object by id
  const previousChecks = previousState.checks.reduce<CheckStateIndex>(
    (obj, check) => ({ ...obj, [check.id]: check }),
    {} as CheckStateIndex,
  )
  // Compare results with previous state
  const changes = results.checks.filter(
    (check) => check.passed !== previousChecks[check.id].passed,
  )
  const changesListText = changes.map(
    (check) =>
      `* ${check.name} → ${check.passed ? ':white_check_mark:' : ':x:'}`,
  )
  return `Changes:\n${changesListText.join(`\n`)}\n\nScore: ${
    previousState.score
  } → ${results.score}`
}
