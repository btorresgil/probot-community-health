require('source-map-support').install()
import { Application } from 'probot'
import createScheduler from 'probot-scheduler'

import { defaultConfig } from './config'
import { performChecks } from './checks'
import { checkStatus, issueMessage } from './messages'
import { isActivePublicRepo } from './helpers'
import { AppConfig } from './types'
import { sendMessage } from './issue'

export = (app: Application) => {
  // createScheduler(app, { interval: 7 * 24 * 60 * 60 * 1000 }) // Trigger each repo once a week
  createScheduler(app, { interval: 60 * 1000, delay: false }) // Trigger each repo every minute
  app.on('schedule.repository', async context => {
    // Don't check private or other non-relevant repos
    if (!isActivePublicRepo(context)) return
    // Read configuration
    const config = (await context.config(
      'community_health_assessment.yml',
      defaultConfig,
    )) as AppConfig
    // Perform checks
    const results = await performChecks(context, config)
    if (results.score < config.threshold) {
      // Open an issue to report results and request changes
      context.log.debug(
        `Failed checks on repo: ${context.payload.repository.full_name}`,
      )
      sendMessage(
        app,
        context,
        `[Community Health Assessment] Changes needed`,
        issueMessage,
        {
          update: checkStatus(results),
          updateAfterDays: 0,
        },
      )
    } else {
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
        },
      )
      context.github.issues.update({
        ...context.repo(),
        issue_number: message.issue,
        state: 'closed',
      })
    }
  })
}
