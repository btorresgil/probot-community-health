import { Application, Context } from 'probot'
import createScheduler from 'probot-scheduler'
import sendMessage from 'probot-messages'

import { performChecks } from './checks'
import { failedChecks } from './messages'
import { isActivePublicRepo } from './helpers'
import { AppConfig } from './types'

const defaultConfig: AppConfig = {
  threshold: 80,
  checks: {
    description: {
      disabled: false,
      name: 'Repo has a description',
      value: 15,
      infoLink: 'https://github.com',
    },
    supportFile: {
      disabled: false,
      name: 'SUPPORT.md file exists',
      value: 15,
      infoLink: 'https://github.com',
    },
    topics: {
      disabled: false,
      name: 'Required topics attached to repo',
      value: 10,
      infoLink: 'https://github.com',
      requiredTopic: [],
      topicCorrections: {},
    },
  },
}

export = (app: Application) => {
  // createScheduler(app, { interval: 7 * 24 * 60 * 60 * 1000 }) // Trigger each repo once a week
  createScheduler(app, { interval: 60 * 1000 }) // Trigger each repo once a week
  app.on('schedule.repository', async context => {
    // Don't check private or other non-relevant repos
    if (!isActivePublicRepo(context)) return
    // Read configuration
    const config = (await context.config(
      'community_health_check.yml',
      defaultConfig,
    )) as AppConfig
    // Perform checks
    const results = await performChecks(context, config)
    if (results.total < config.threshold) {
      // Open an issue to report results and request changes
      sendMessage(
        app,
        context,
        `[Community Health Check] - Changes needed`,
        failedChecks(results),
      )
    }
  })

  // app.on('issues.opened', async context => {
  //   const issueComment = context.issue({
  //     body: 'Thanks for opening this issue!',
  //   })
  //   await context.github.issues.createComment(issueComment)
  // })
}
