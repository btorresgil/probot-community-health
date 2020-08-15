import { Context, Octokit } from 'probot'
import metadata from 'probot-metadata'
import R from 'ramda'

import { PrimaryCheckConfig, CheckResult, AllCheckResults } from './types'

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

export function result(
  config: PrimaryCheckConfig,
  passed?: boolean,
): CheckResult {
  const skipped = passed === undefined
  return {
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
  const topicsResponse = await context.github.repos.listTopics(context.repo())
  return topicsResponse.data.names
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
  const dir = await context.github.repos.getContents({
    ...context.repo(),
    path: dirPath,
  })
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

export function fetchPreviousScore(
  context: Context<any>,
  issue?: any,
): Promise<number | undefined> {
  return metadata(context, issue).get('score')
}

export function setScore(
  score: number,
  context: Context<any>,
  issue?: any,
): Promise<Octokit.IssuesUpdateResponse> {
  return metadata(context, issue).set('score', score)
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
