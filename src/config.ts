import { AppConfig } from './types'

export const defaultConfig: AppConfig = {
  threshold: 80,
  checks: {
    description: {
      disabled: false,
      name: 'Repo has a description',
      value: 15,
      infoLink: 'https://github.com',
    },
    readmeFile: {
      disabled: false,
      name: 'Contains a meaningful README.md file',
      value: 15,
      infoLink: 'https://github.com',
    },
    supportFile: {
      disabled: false,
      name: 'SUPPORT.md file exists',
      value: 15,
      infoLink: 'https://github.com',
    },
    repoName: {
      disabled: false,
      name: 'Has a descriptive repo name',
      value: 10,
      infoLink: 'https://github.com',
    },
    contributingFile: {
      disabled: false,
      name: 'CONTRIBUTING.md file with contribution guidelines',
      value: 10,
      infoLink: 'https://github.com',
    },
    topics: {
      disabled: false,
      name: 'Required topics attached to repo',
      value: 10,
      infoLink: 'https://github.com',
      requiredTopic: [],
      topicCorrections: {},
    },
    customTemplates: {
      disabled: false,
      name: 'Has custom issue and pull request templates',
      value: 5,
      infoLink: 'https://github.com',
    },
    codeOfConductFile: {
      disabled: false,
      name: 'Has a CODE_OF_CONDUCT.md file',
      value: 5,
      infoLink: 'https://github.com',
    },
  },
}
