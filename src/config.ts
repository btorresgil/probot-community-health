import { AppConfig } from './types'

export const defaultConfig: AppConfig = {
  threshold: 80,
  checks: {
    description: {
      disabled: false,
      name: 'Repo has a description',
      value: 15,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#repository-description',
    },
    readmeFile: {
      disabled: false,
      name: 'Contains a meaningful README.md file',
      value: 15,
      size: 200,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#readme-md-file',
    },
    supportFile: {
      disabled: false,
      name: 'SUPPORT.md file exists',
      value: 15,
      size: 50,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#support-file',
    },
    repoName: {
      disabled: false,
      name: 'Has a descriptive repo name',
      value: 10,
      length: 10,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#repository-name',
    },
    contributingFile: {
      disabled: false,
      name: 'CONTRIBUTING.md file with contribution guidelines',
      value: 10,
      size: 200,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#contribution-guidelines',
    },
    topics: {
      disabled: false,
      name: 'Required topics attached to repo',
      value: 10,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#repository-topics',
      requiredTopic: [],
      topicCorrections: {},
    },
    customTemplates: {
      disabled: false,
      name: 'Has custom issue and pull request templates',
      value: 5,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#issue-and-pr-templates',
    },
    codeOfConductFile: {
      disabled: false,
      name: 'Has a CODE_OF_CONDUCT.md file',
      value: 5,
      size: 200,
      infoLink:
        'https://github.com/btorresgil/probot-community-health/docs/checks.md#code-of-conduct',
    },
  },
}
