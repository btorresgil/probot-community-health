declare module 'probot-scheduler' {
  import { Application, Probot } from 'probot'
  export = createScheduler
  function createScheduler(
    app: Application,
    options?: createScheduler.ProbotSchedulerOptions,
  ): void
  namespace createScheduler {
    export interface ProbotSchedulerOptions {
      delay?: boolean
      interval?: number
    }
  }
}

// declare module 'probot-messages' {
//   import { Application, Context } from 'probot'
//   export = sendMessage
//   function sendMessage(
//     app: Application,
//     context: Context<any>,
//     title: string,
//     message: string,
//     options?: sendMessage.ProbotMessagesOptions,
//   ): sendMessage.Message
//   namespace sendMessage {
//     export interface ProbotMessagesOptions {
//       update?: string
//       updateAfterDays?: number
//       owner?: string
//       repo?: string
//     }
//     export interface Message {
//       owner: string
//       repo: string
//       issue: number
//       comment?: number
//       isNew: boolean
//     }
//   }
// }

declare module 'probot-metadata' {
  import { Context } from 'probot'
  import { Octokit } from '@octokit/rest'
  export = metadata
  function metadata(
    context: Context,
    issue?: { number: any; owner: string; repo: string } | null,
  ): metadata.ProbotMetadataGetSet
  namespace metadata {
    export interface ProbotMetadataOptions {
      context: Context
    }
    export interface ProbotMetadataGetSet {
      get(key: string | null): Promise<any>
      get<T>(key: string | null): Promise<T>

      set(key: string, value: any): Promise<Octokit.IssuesUpdateResponse>
    }
  }
}
