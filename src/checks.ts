import { Context } from 'probot'
import pMapSeries from 'p-map-series'
import * as R from 'ramda'

import {
  fetchFile,
  result,
  fetchRepoTopics,
  issueTemplateExists,
  transposeTopicCorrections,
} from './helpers'
import { AppConfig, CheckResult, AllCheckResults } from './types'

export function checkDescription(
  context: Context,
  appConfig: AppConfig,
): CheckResult {
  const config = appConfig.checks.description
  if (config.disabled) return result(config)
  const description = context.payload.repository.description
  const passed = description !== null && description.length > 0
  return result(config, passed)
}

export async function checkReadmeFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.readmeFile
  if (config.disabled) return result(config)
  const file = await fetchFile(context, 'README.md')
  const passed = file && file.size >= config.size ? true : false
  return result(config, passed)
}

export async function checkLicenseFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.licenseFile
  if (config.disabled) return result(config)
  const license = context.payload.repository.license
  // license == null: No LICENSE file
  const passed = license !== null
  return result(config, passed)
}

export async function checkLicense(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.license
  if (config.disabled) return result(config)
  const license = context.payload.repository.license
  // license == null: No LICENSE file
  if (license === null) return result(config, false)
  const approvedLicenses = config.licenses
  // license.key === "other": LICENSE file is not standard
  if (approvedLicenses === null) return result(config, license.key !== 'other')
  const passed = approvedLicenses.includes(license.key)
  return result(config, passed)
}

export async function checkSupportFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.supportFile
  if (config.disabled) return result(config)
  const file = await fetchFile(context, 'SUPPORT.md')
  const passed = file && file.size >= config.size ? true : false
  return result(config, passed)
}

export function checkRepoName(
  context: Context,
  appConfig: AppConfig,
): CheckResult {
  const config = appConfig.checks.repoName
  if (config.disabled) return result(config)
  const passed = context.payload.repository.name.length > config.length
  return result(config, passed)
}

export async function checkContributingFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.contributingFile
  if (config.disabled) return result(config)
  const file = await fetchFile(context, 'CONTRIBUTING.md')
  const passed = file && file.size >= config.size ? true : false
  return result(config, passed)
}

export async function checkTopics(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.topics
  if (config.disabled) return result(config)
  // Fetch topics for repo
  const repo = context.payload.repository
  const topics = await fetchRepoTopics(context)
  // Validate topics
  const topicsToCorrect = transposeTopicCorrections(config.topicCorrections)
  const correctedTopics = topics.map((topic) => topicsToCorrect[topic] || topic)
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

export async function checkCustomTemplates(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.customTemplates
  if (config.disabled) return result(config)
  const issueTemplatePassed = await issueTemplateExists(context)
  const pullRequestTemplate = await fetchFile(
    context,
    '.github/PULL_REQUEST_TEMPLATE.md',
  )
  const pullRequestTemplatePassed = pullRequestTemplate !== null
  return result(config, issueTemplatePassed && pullRequestTemplatePassed)
}

export async function checkCodeOfConductFile(
  context: Context,
  appConfig: AppConfig,
): Promise<CheckResult> {
  const config = appConfig.checks.codeOfConductFile
  if (config.disabled) return result(config)
  const file = await fetchFile(context, 'CODE_OF_CONDUCT.md')
  const passed = file && file.size >= config.size ? true : false
  return result(config, passed)
}

export const checks = [
  checkDescription,
  checkReadmeFile,
  checkLicenseFile,
  checkLicense,
  checkSupportFile,
  checkRepoName,
  checkContributingFile,
  checkTopics,
  checkCustomTemplates,
  checkCodeOfConductFile,
]

export async function performChecks(
  context: Context,
  config: AppConfig,
): Promise<AllCheckResults> {
  const checkResults = await pMapSeries(checks, (check) =>
    check(context, config),
  )
  return {
    checks: checkResults,
    score: R.sum(checkResults.map((result) => result.score)),
    total: R.sum(checkResults.map((result) => result.value)),
    threshold: config.threshold,
  }
}
