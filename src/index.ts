import { Application, Context } from 'probot'
import getConfig from 'probot-config'
import createScheduler from 'probot-scheduler'
import sendMessage from 'probot-messages'
import { performChecks } from './checks'
import { failedChecks } from './messages'

// const TOPIC_VARIANTS: string[] = Object.values(TOPIC_MAP).flat()
const THRESHOLD = 80

function isActivePublicRepo(context: Context): boolean {
  const repo = context.payload.repository
  if (repo.private || repo.fork || repo.archived || repo.disabled) {
    return false
  } else {
    return true
  }
}

export = (app: Application) => {
  // createScheduler(app, { interval: 7 * 24 * 60 * 60 * 1000 }) // Trigger each repo once a week
  createScheduler(app, { interval: 60 * 1000 }) // Trigger each repo once a week
  app.on('schedule.repository', async context => {
    // Don't check private or other non-relevant repos
    if (!isActivePublicRepo(context)) return
    // Read configuration
    const config = await getConfig(context, 'community_health_check.yml')
    // Perform checks
    const results = await performChecks(context, config)
    if (results.total < THRESHOLD) {
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
