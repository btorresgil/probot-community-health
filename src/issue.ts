/**
 * Stollen shamelessly from the probot-messages npm package.
 * https://github.com/dessant/probot-messages/blob/master/src/index.js
 *
 * Needed to modify the behavior so that the same issue is always used.
 */

import { Context } from 'probot'
import { Octokit } from '@octokit/rest'
import crypto from 'crypto'

import { AppInfo, AllCheckResults } from './types'
import { checkStatus, closeMessage } from './messages'

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
  owner?: string
  repo?: string
  issue?: Octokit.IssuesListForRepoResponseItem | null
  searchString?: string
}

export function hashMessage(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex')
}

export async function findMessage(
  context: Context<any>,
  appSlug: string,
  searchString?: string,
  { owner, repo }: { owner?: string; repo?: string } = {},
): Promise<Octokit.IssuesListForRepoResponseItem | null> {
  if (!owner || !repo) {
    ;({ owner, repo } = context.repo())
  }
  const hash = hashMessage(searchString || appSlug)
  const messageHashRx = new RegExp(`<!--${hash}-->`)
  const { data: issues } = await context.github.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    creator: `${appSlug}[bot]`,
    per_page: 100,
  })

  for (const issue of issues) {
    if (messageHashRx.test(issue.body)) {
      return issue
    }
  }
  return null
}

/**
 * Update the body of an issue, or creates it if it doesn't exist

 * @param {Object} app app instance
 * @param {Object} context event context
 * @param {string} title issue title, `{appName}` and `{appUrl}`
 *   are optional placeholders
 * @param {string} message issue content, `{appName}` and `{appUrl}`
 *   are optional placeholders
 * @param {Object} [options] options
 * @param {string} [options.owner] owner of the repository
 *   (optional, default value inferred from `context`)
 * @param {string} [options.repo] repository
 *   (optional, default value inferred from `context`)
 * @param {number} [options.issue] the issue number
 * @param {string} [options.searchString] a string to use to mark the issue for
 *   future updates

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
export async function createUpdateIssueBody(
  context: Context<any>,
  appInfo: AppInfo,
  title: string,
  message: string,
  { owner, repo, issue, searchString }: SendMessageOptions = {},
): Promise<Message> {
  if (!appInfo || !context || !title || !message) {
    throw new Error('Required parameter missing')
  }

  if (!owner || !repo) {
    ;({ owner, repo } = context.repo())
  }

  const { appName, appUrl, appSlug } = appInfo

  const hash = hashMessage(searchString || appSlug)

  if (!issue) {
    issue = await findMessage(context, appSlug, hash, {
      owner,
      repo,
    })
  }

  title = title.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)
  message = message.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)

  if (!issue) {
    // Issue doesn't exist so create a new one
    const { data: issueData } = await context.github.issues.create({
      owner,
      repo,
      title,
      body: `${message}\n<!--${hash}-->`,
    })
    return new Message(owner, repo, issueData.number, null, true)
  } else {
    // Issue exists so update body of existing issue
    const { data: issueData } = await context.github.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      body: `${message}\n<!--${hash}-->`,
    })
    return new Message(owner, repo, issueData.number, null, false)
  }
}

export async function createComment(
  context: Context<any>,
  appInfo: AppInfo,
  message: string,
  { owner, repo, issue, searchString }: SendMessageOptions = {},
): Promise<Message | null> {
  if (!owner || !repo) {
    ;({ owner, repo } = context.repo())
  }
  const { appName, appUrl, appSlug } = appInfo
  const hash = hashMessage(searchString || appSlug)
  if (!issue) {
    issue = await findMessage(context, appSlug, hash, {
      owner,
      repo,
    })
  }
  if (!issue) {
    throw new Error(
      `Unable to find issue for comment on repo: ${owner}/${repo}`,
    )
  }
  if (issue.locked) return null

  message = message.replace(/{appName}/, appName).replace(/{appUrl}/, appUrl)

  const { data: commentData } = await context.github.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: message,
  })

  return new Message(owner, repo, issue.number, commentData.id, false)
}

export async function closeIssue(
  context: Context,
  appInfo: AppInfo,
  issue: Octokit.IssuesListForRepoResponseItem,
  results: AllCheckResults,
): Promise<void> {
  await createComment(context, appInfo, closeMessage, {
    issue,
  })
  context.github.issues.update({
    ...context.repo(),
    issue_number: issue.number,
    state: 'closed',
    body: checkStatus(results),
  })
}
