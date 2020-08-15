export const unsortedResultsFixture = {
  checks: [
    {
      name: 'check1',
      passed: true,
      score: 10,
      value: 10,
      infoLink: '',
      skipped: false,
    },
    {
      name: 'check2',
      passed: true,
      score: 10,
      value: 20,
      infoLink: '',
      skipped: false,
    },
    {
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
export const sortedResultsFixture = {
  checks: [
    {
      name: 'check3',
      passed: false,
      score: 0,
      value: 30,
      infoLink: '',
      skipped: false,
    },
    {
      name: 'check2',
      passed: true,
      score: 10,
      value: 20,
      infoLink: '',
      skipped: false,
    },
    {
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
