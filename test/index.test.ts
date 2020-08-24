import nock from 'nock'
// Requiring our app implementation
import myProbotApp from '../src'
import { Probot } from 'probot'
// Requiring our fixtures
import payload from './fixtures/schedule.repository.json'
const fs = require('fs')
const path = require('path')

jest.setTimeout(2000)
nock.emitter.on('no match', (req: any) => {
  // console.log('no match:', JSON.stringify(req, null, 2))
  console.log('no match:', req.path)
})

describe('Community Health App', () => {
  let probot: any
  let mockCert: string

  beforeAll((done: Function) => {
    fs.readFile(
      path.join(__dirname, 'fixtures/mock-cert.pem'),
      (err: Error, cert: string) => {
        if (err) return done(err)
        mockCert = cert
        done()
      },
    )
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert, githubToken: 'test' })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('webhook checks for app config', async (done) => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })
      .get('/app/installations?per_page=100')
      .reply(200, [])

    // Refresh repo details first
    nock('https://api.github.com')
      .get('/repos/my-org/testing-things')
      .reply(200, payload.repository)

    nock('https://api.github.com')
      .get(
        '/repos/my-org/testing-things/contents/.github/community_health_assessment.yml',
      )
      .reply(200, {})
      .get(
        '/repos/my-org/.github/contents/.github/community_health_assessment.yml',
        (body: any) => {
          done()
          return true
        },
      )
      .reply(200, {})

    // Receive a webhook event
    await probot.receive({ name: 'schedule', payload })
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
