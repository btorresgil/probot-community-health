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

declare module 'probot-messages' {
  import { Application, Context } from 'probot'
  export = sendMessage
  function sendMessage(
    app: Application,
    context: Context<any>,
    title: string,
    message: string,
    options?: sendMessage.ProbotMessagesOptions,
  ): sendMessage.Message
  namespace sendMessage {
    export interface ProbotMessagesOptions {
      update?: string
      updateAfterDays?: number
      owner?: string
      repo?: string
    }
    export interface Message {
      owner: string
      repo: string
      issue: number
      comment?: number
      isNew: boolean
    }
  }
}
