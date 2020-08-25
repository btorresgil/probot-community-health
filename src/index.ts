// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install()
import { Application, Context } from 'probot'
import R from 'ramda'

import { defaultConfig } from './config'
import { performChecks } from './checks'
import { checkStatus, issueMessage, issueTitle } from './messages'
import {
  isActivePublicRepo,
  fetchPreviousState,
  setState,
  sortResultsByValue,
  refreshRepo,
  fetchAppInfo,
  generateState,
  changesMessage,
} from './helpers'
import { AppConfig, State } from './types'
import {
  createUpdateIssueBody,
  findMessage,
  closeIssue,
  createComment,
} from './issue'

async function main(app: Application, context: Context) {
  // Authenticate the app to get the name, url, and slug
  const appInfo = await fetchAppInfo(app)
  // Get the latest information on this repo
  context.payload.repository = await refreshRepo(context)
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

  const issue = await findMessage(context, appInfo.appSlug)

  if (results.score >= config.threshold) {
    if (!issue) return
    context.log.info(
      `Repo changed from problems to success, closing issue: ${context.payload.repository.full_name}`,
    )
    closeIssue(context, appInfo, issue, results)
    return
  }

  let previousState: State | undefined
  if (issue) {
    previousState = await fetchPreviousState(context, issue)

    if (R.equals(previousState, generateState(results))) {
      context.log.info(
        `Changes needed on repo (${context.payload.repository.full_name}), but same state (score:${results.score}) as last time, do nothing`,
      )
      return
    }
  }

  // Log what will be done
  context.log.info(
    `Changes needed on repo, ${issue ? 'updating' : 'creating'} issue: ${
      context.payload.repository.full_name
    }`,
  )

  const message = await createUpdateIssueBody(
    context,
    appInfo,
    issueTitle,
    `${issueMessage}\n${checkStatus(results)}`,
    {
      issue,
    },
  )
  await setState(results, context, {
    owner: message.owner,
    repo: message.repo,
    number: message.issue,
  })
  // Create comment with what changed
  if (issue && previousState) {
    await createComment(
      context,
      appInfo,
      changesMessage(results, previousState),
      { issue },
    )
  }
}

export = (app: Application): void => {
  app.on(
    [
      'repository.edited',
      'repository.renamed',
      'repository.publicized',
      'star.created',
      'fork',
      'watch',
    ],
    async (context) => {
      if (context.payload.repository.private) return
      return await main(app, context)
    },
  )
  app.on('push', async (context) => {
    if (context.payload.repository.private) return
    if (
      context.payload.ref !==
      `refs/heads/${context.payload.repository.default_branch}`
    )
      return
    return await main(app, context)
  })
}
