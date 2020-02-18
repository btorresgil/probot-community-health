import { Context } from 'probot'

import { PrimaryCheckConfig, CheckResult } from './types'

export function isActivePublicRepo(context: Context): boolean {
  const repo = context.payload.repository
  if (repo.private || repo.fork || repo.archived || repo.disabled) {
    return false
  } else {
    return true
  }
}

export function result(
  config: PrimaryCheckConfig,
  passed?: boolean,
): CheckResult {
  return {
    passed: passed || false,
    name: config.name,
    value: config.value,
    infoLink: config.infoLink,
    score: passed ? config.value : 0,
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
  const file = await context.github.repos.getContents({
    ...context.repo(),
    path: filePath,
  })
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
