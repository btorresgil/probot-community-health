// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install()
import { Application } from 'probot'
import createScheduler from 'probot-scheduler'

import { defaultConfig } from './config'
import { performChecks } from './checks'
import { checkStatus, issueMessage } from './messages'
import {
  isActivePublicRepo,
  fetchPreviousScore,
  setScore,
  sortResultsByValue,
} from './helpers'
import { AppConfig } from './types'
import { sendMessage, hashMessage, findMessage } from './issue'

// Default interval is every 12 hours (12 * 60 * 60 * 1000 = 43200000)
const INTERVAL = parseInt(process.env.INTERVAL || '43200000')

export = (app: Application): void => {
  createScheduler(app, { interval: INTERVAL })
  app.on('schedule.repository', async (context) => {
    // Don't check private or other non-relevant repos
    if (!isActivePublicRepo(context)) return
    // Read configuration
    const config = (await context.config(
      'community_health_assessment.yml',
      defaultConfig,
    )) as AppConfig

    // Perform checks
    const resultsUnsorted = await performChecks(context, config)
    const results = sortResultsByValue(resultsUnsorted)

    const issueTitle = '[Community Health Assessment] Changes needed'
    const hash = hashMessage(issueTitle)

    const issue = await findMessage(app, context, hash)

    if (issue) {
      const previousScore = await fetchPreviousScore(context, issue)

      if (results.score === previousScore) {
        context.log.info(
          `Failed checks on repo, but same score as last time, do nothing: ${context.payload.repository.full_name}`,
        )
        return
      }
    }

    if (results.score < config.threshold) {
      // Open an issue to report results and request changes
      context.log.info(
        `Failed checks on repo: ${context.payload.repository.full_name}`,
      )
      const message = await sendMessage(
        app,
        context,
        `[Community Health Assessment] Changes needed`,
        issueMessage,
        {
          update: checkStatus(results),
          updateAfterDays: 7,
          issue,
          hash,
        },
      )
      await setScore(results.score, context, {
        owner: message.owner,
        repo: message.repo,
        number: message.issue,
      })
    } else {
      if (issue) {
        context.log.info(
          `Repo changed from failed to success: ${context.payload.repository.full_name}`,
        )
        const message = await sendMessage(
          app,
          context,
          `[Community Health Assessment] Changes needed`,
          issueMessage,
          {
            update:
              checkStatus(results) +
              `\n\nCongratulations! This repo has met the community health requirements!`,
            updateAfterDays: 0,
            issue,
            hash,
          },
        )
        context.github.issues.update({
          ...context.repo(),
          issue_number: message.issue,
          state: 'closed',
        })
      }
    }
  })
}
