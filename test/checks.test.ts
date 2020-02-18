import nock from 'nock'
// Requiring our app implementation
import myProbotApp from '../src'
import { Probot, Context } from 'probot'
import { createApp } from './helpers'
// Requiring our fixtures
import payload from './fixtures/schedule.repository.json'
import { checkTopics } from '../src/checks'
import { AppConfig } from '../src/config'
const fs = require('fs')
const path = require('path')

describe('Health checks', () => {
  let probot: any
  let context: Context
  let mockCert: string
  let config: AppConfig

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

  beforeEach(async () => {
    nock.disableNetConnect()
    // probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    // probot.load(myProbotApp)
    // probot.githubToken = 'test'
    probot = createApp(myProbotApp)
    // Create a default context
    context = new Context(
      { id: '1', name: 'schedule', payload } as any,
      await probot.auth(2),
      probot.log,
    )
    config = {
      checks: {
        topics: {
          requiredTopic: ['required1'],
        },
      },
    }
  })

  test('check fails if missing required topic', async done => {
    nock('https://api.github.com')
      .get('/repos/my-org/testing-things/topics')
      .reply(200, { names: ['topic1', 'topic2', 'topic3'] })

    const result = await checkTopics(context, config)
    expect(result.passed).toBe(false)
    await done()
  })

  test('check passes if contains required topic', async done => {
    nock('https://api.github.com')
      .get('/repos/my-org/testing-things/topics')
      .reply(200, { names: ['required1', 'topic2', 'topic3'] })

    const result = await checkTopics(context, config)
    expect(result.passed).toBe(true)
    await done()
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about using TypeScript in your tests, Jest recommends:
// https://github.com/kulshekhar/ts-jest

// For more information about testing with Nock see:
// https://github.com/nock/nock
