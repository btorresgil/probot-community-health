// You can import your modules
// import index from '../src/index'

import nock from 'nock'
// Requiring our app implementation
import myProbotApp from '../src'
import { Probot, Context } from 'probot'
// Requiring our fixtures
import payload from './fixtures/schedule.repository.json'
const fs = require('fs')
const path = require('path')

describe('My Probot app', () => {
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
    probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('webhook checks for app config', async done => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })
      .get('/app/installations?per_page=100')
      .reply(200, [])

    nock('https://api.github.com')
      .get(
        '/repos/my-org/testing-things/contents/.github/community_health_check.yml',
      )
      .reply(200, {})
      .get(
        '/repos/my-org/.github/contents/.github/community_health_check.yml',
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
