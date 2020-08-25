import { AllCheckResults } from '../../src/types'

export const unsortedResultsFixture: AllCheckResults = {
  checks: [
    {
      id: 'description',
      name: 'check1',
      passed: true,
      score: 10,
      value: 10,
      infoLink: '',
      skipped: false,
    },
    {
      id: 'readmeFile',
      name: 'check2',
      passed: true,
      score: 10,
      value: 20,
      infoLink: '',
      skipped: false,
    },
    {
      id: 'supportFile',
      name: 'check3',
      passed: false,
      score: 0,
      value: 30,
      infoLink: '',
      skipped: false,
    },
  ],
  score: 500,
  total: 500,
  threshold: 400,
}
export const sortedResultsFixture: AllCheckResults = {
  checks: [
    {
      id: 'supportFile',
      name: 'check3',
      passed: false,
      score: 0,
      value: 30,
      infoLink: '',
      skipped: false,
    },
    {
      id: 'readmeFile',
      name: 'check2',
      passed: true,
      score: 10,
      value: 20,
      infoLink: '',
      skipped: false,
    },
    {
      id: 'description',
      name: 'check1',
      passed: true,
      score: 10,
      value: 10,
      infoLink: '',
      skipped: false,
    },
  ],
  score: 500,
  total: 500,
  threshold: 400,
}
