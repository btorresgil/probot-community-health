import Handlebars from 'handlebars'

export const issueMessage = `This issue was opened by a bot called [{appName}]({appUrl}) because this repo has failed too many community health checks.

**Repo maintainers:** Please take the time to fix the issues in the table to reach the target score. These improvements will help others find your work and contribute to it. This issue will update as your score improves until it hits the target score.

Click **More info** for instructions to fix each item.
`

export const issueTitle = '[Community Health Assessment] Changes needed'

export const closeMessage = `:tada: Congratulations! This repo has met the community health requirements! :tada:`

export const checkStatus = Handlebars.compile(
  `
| Health Check | Pass | Score | More Info |
| ------------ | ---- | ----- | --------- |
{{#each checks~}}
{{#unless this.skipped~}}
| {{this.name}} | {{#if this.passed}}:white_check_mark:{{else}}:x:{{/if}} | {{this.score}} / {{this.value}} | [More info]({{this.infoLink}})
{{/unless}}
{{/each}}

Current score: {{score}}
Target threshold: {{threshold}}
Total possible: {{total}}
`,
  { strict: true },
)
