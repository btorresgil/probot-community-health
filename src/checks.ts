import { Context } from 'probot'
import pMapSeries from 'p-map-series'
import * as R from 'ramda'

import { AppConfig, defaults } from './config'

interface CheckResult {
  name: string
  passed: boolean
  score: number
  value: number
  infoLink: string
}

interface AllCheckResults {
  checks: CheckResult[]
  score: number
  total: number
}

async function fetchRepoTopics(context: Context<any>): Promise<string[]> {
  const topicsResponse = await context.github.repos.listTopics(context.repo())
  return topicsResponse.data.names
}

export async function checkTopics(
  context: Context,
  appConfig?: AppConfig,
): Promise<CheckResult> {
  const config = {
    ...defaults!.checks!.topics,
    ...appConfig?.checks?.topics,
  }
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
  return {
    passed,
    name: config.name,
    value: config.value,
    infoLink: config.infoLink,
    score: passed ? config.value : 0,
  }
}

export const checks = [checkTopics]

export async function performChecks(
  context: Context,
  config: any,
): Promise<AllCheckResults> {
  const checkResults = await pMapSeries(checks, check => check(context, config))
  return {
    checks: checkResults,
    score: R.sum(checkResults.map(result => result.score)),
    total: R.sum(checkResults.map(result => result.value)),
  }
}
