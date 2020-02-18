import Handlebars from 'handlebars'

export const failedChecks = Handlebars.compile(
  `# Community Health Check

This issue was opened by a bot called [{appName}]({appUrl}) because this repo is failing too many community health checks.

| Health Check | Status | Score | Value | More Information |
| ------------ | ------ | ----- | ----- | ---------------- |
{{#each checks}}
| {{this.name}} | {{#if this.passed}}<span style="color: green;">PASS</span>{{else}}<span style="color: red;">FAIL</span>{{/if}} | {{this.score}} | {{this.value}} | {{this.infoLink}}
{{/each}}

Current Score: {{score}}
Target Score: 80

Repo maintainers, please take the time to improve the items above to reach the target score.
These improvements will help others find your work and contribute to it.

I'll update this issue as your score improves until it hits the target.

Thank you!
`,
  { strict: true },
)
