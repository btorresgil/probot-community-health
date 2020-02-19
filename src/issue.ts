/**
 * Stollen shamelessly from the probot-messages npm package.
 * https://github.com/dessant/probot-messages/blob/master/src/index.js
 *
 * Needed to modify the behavior so that the same issue is always used.
 */

import { Application, Context } from 'probot'
import { Octokit } from '@octokit/rest'
import crypto from 'crypto'

/**
 * Details of the message.

 * @typedef {Object} Message
 * @property {string} owner owner of the repository
 * @property {string} repo repository
 * @property {number} issue issue number of the message
 * @property {?number} comment comment ID of the update
 * @property {boolean} isNew indicates if the issue was newly created
 */
class Message {
  public owner: string
  public repo: string
  public issue: number
  public comment: number | null
  public isNew: boolean
  constructor(
    owner: string,
    repo: string,
    issue: number,
    comment: number | null,
    isNew: boolean,
  ) {
    this.owner = owner
    this.repo = repo
    this.issue = issue
    this.comment = comment
    this.isNew = isNew
  }
}

export interface SendMessageOptions {
  update?: string
  updateAfterDays?: number
  owner?: string
  repo?: string
  issue?: Octokit.IssuesListForRepoResponseItem | null
}

export async function authenticateMessenger(
  app: Application,
): Promise<{ appName: string; appUrl: string; appSlug: string }> {
  const appGh = await app.auth()
  const { name: appName, html_url: appUrl, slug: appSlug } = (
    await appGh.apps.getAuthenticated()
  ).data
  return { appName, appUrl, appSlug }
}

export function hashMessage(message: string): string {
  return crypto
    .createHash('sha256')
    .update(message)
    .digest('hex')
}

async function findMessage(
  app: Application | string,
  context: Context<any>,
  messageHash: string,
  { owner, repo }: { owner?: string; repo?: string } = {},
): Promise<Octokit.IssuesListForRepoResponseItem | null> {
  let appSlug: string
  if (typeof app === 'string') {
    appSlug = app
  } else {
    appSlug = (await authenticateMessenger(app)).appSlug
  }
  if (!owner || !repo) {
    ;({ owner, repo } = context.repo())
  }
  const messageHashRx = new RegExp(`<!--${messageHash}-->`)
  const { data: issues } = await context.github.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    creator: `${appSlug}[bot]`,
    per_page: 100,
  })

  for (const issue of issues) {
    if (!messageHashRx.test(issue.body)) {
      continue
    }
    return issue
  }
  return null
}

export async function findMessageIssue(
  app: Application,
  context: Context<any>,
  message: string,
): Promise<Octokit.IssuesListForRepoResponseItem | null> {
  const { appName, appUrl } = await authenticateMessenger(app)
  const messageHash = hashMessage(
    message.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl),
  )
  return await findMessage(appName, context, messageHash)
}

/**
 * Messages repository maintainers by submitting an issue.

 * @param {Object} app app instance
 * @param {Object} context event context
 * @param {string} title issue title, `{appName}` and `{appUrl}`
 *   are optional placeholders
 * @param {string} message issue content, `{appName}` and `{appUrl}`
 *   are optional placeholders
 * @param {Object} [options] options
 * @param {string} [options.update] update to post as a comment, `{appName}`
 *   and `{appUrl}` are optional placeholders, no update is posted if the value
 *   is {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy|falsy}
 *   or the issue is locked
 * @param {number} [options.updateAfterDays] post update only if the issue
 *   had no activity in this many days
 * @param {string} [options.owner] owner of the repository
 *   (optional, default value inferred from `context`)
 * @param {string} [options.repo] repository
 *   (optional, default value inferred from `context`)

 * @returns {Promise<Message>} {@link Promise}
 *   that will be fulfilled with a {@link Message} object

 * @example
 * const sendMessage = require('probot-messages');

 * module.exports = app => {
 *   app.on('issue_comment.created', async context => {
 *     await sendMessage(app, context, 'Title', 'Message');
 *   });
 * };
 */
export async function sendMessage(
  app: Application,
  context: Context<any>,
  title: string,
  message: string,
  {
    update = '',
    updateAfterDays = 7,
    owner,
    repo,
    issue,
  }: SendMessageOptions = {},
): Promise<Message> {
  if (!app || !context || !title || !message) {
    throw new Error('Required parameter missing')
  }

  if (!owner || !repo) {
    ;({ owner, repo } = context.repo())
  }

  const { appName, appUrl, appSlug } = await authenticateMessenger(app)

  message = message.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)
  const messageHash = hashMessage(message)

  if (!issue) {
    issue = await findMessage(appSlug, context, messageHash, {
      owner,
      repo,
    })
  }

  let commentId = null

  if (issue) {
    // Issue exists and is open, so update it
    if (
      update &&
      !issue.locked &&
      Date.now() - Date.parse(issue.updated_at) >=
        updateAfterDays * 24 * 60 * 60 * 1000
    ) {
      update = update.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)

      const { data: commentData } = await context.github.issues.createComment({
        owner,
        repo,
        issue_number: issue.number,
        body: update,
      })
      commentId = commentData.id
    }

    return new Message(owner, repo, issue.number, commentId, false)
  }

  // Issue doesn't exist so create a new one

  title = title.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)

  const { data: issueData } = await context.github.issues.create({
    owner,
    repo,
    title,
    body: `${message}\n<!--${messageHash}-->`,
  })

  if (update) {
    update = update.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)

    const { data: commentData } = await context.github.issues.createComment({
      owner,
      repo,
      issue_number: issueData.number,
      body: update,
    })
    commentId = commentData.id
  }

  return new Message(owner, repo, issueData.number, commentId, true)
}
