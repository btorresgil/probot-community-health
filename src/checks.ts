import { Context } from 'probot'
import pMapSeries from 'p-map-series'
import * as R from 'ramda'

import { fetchFile, result, fetchRepoTopics } from './helpers'
import { AppConfig, CheckResult, AllCheckResults } from './types'

export function checkDescription(
  context: Context,
  appConfig: AppConfig,
): CheckResult {
  const config = appConfig.checks.description
  const passed = context.payload.repository.description.length > 0
  return result(config, passed)
}

export async function checkSupportFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.supportFile
  const supportFile = await fetchFile(context, 'SUPPORT.md')
  const passed = supportFile && supportFile.size >= 50 ? true : false
  return result(config, passed)
}

export async function checkTopics(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.topics
  // Fetch topics for repo
  const repo = context.payload.repository
  const topics = await fetchRepoTopics(context)
  // Validate topics
  const correctedTopics = topics.map(
    topic => config.topicCorrections[topic] || topic,
  )
  if (!R.equals(topics, correctedTopics)) {
    // Made change to topic format, so apply change
    context.log.debug(
      `Found topics to correct on repo ${repo.full_name}: ${topics}`,
    )
    context.github.repos.replaceTopics({
      ...context.repo(),
      names: correctedTopics,
    })
    context.log.info(`Corrected topics on repo ${repo.full_name}`)
  }
  // Check if repo has a topic from the list of required topics
  const passed =
    !config.requiredTopic || config.requiredTopic.length === 0
      ? true
      : correctedTopics.reduce<boolean>(
          (res, topic) => res || config.requiredTopic.includes(topic),
          false,
        )
  return result(config, passed)
}

export const checks = [checkTopics]

export async function performChecks(
  context: Context,
  config: AppConfig,
): Promise<AllCheckResults> {
  const checkResults = await pMapSeries(checks, check => check(context, config))
  return {
    checks: checkResults,
    score: R.sum(checkResults.map(result => result.score)),
    total: R.sum(checkResults.map(result => result.value)),
  }
}
