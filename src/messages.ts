import Handlebars from 'handlebars'

export const issueMessage = `This issue was opened by a bot called [{appName}]({appUrl}) because this repo has failed too many community health checks.

Repo maintainers please take the time to improve the items above to reach the target score. These improvements will help others find your work and contribute to it. This issue will update as your score improves until it hits the target.

**See the comments below** for information on which health checks need attention.
`

export const checkStatus = Handlebars.compile(
  `
| Health Check | Pass | Score | More Info |
| ------------ | ---- | ----- | --------- |
{{#each checks}}
| {{this.name}} | {{#if this.passed}}✅{{else}}❌{{/if}} | {{this.score}} / {{this.value}} | [More info]({{this.infoLink}})
{{/each}}

Current Score: {{score}}
Target Score: {{threshold}}
`,
  { strict: true },
)
