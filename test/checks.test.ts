import nock from 'nock'
// Requiring our app implementation
import myProbotApp from '../src'
import { Probot, Context } from 'probot'
import { createApp, createConfig } from './test-helpers'
// Requiring our fixtures
import payload from './fixtures/repository.edited.json'

import licenseOther from './fixtures/license-other.json'
import licenseISC from './fixtures/license-isc.json'
import {
  checkDescription,
  checkReadmeFile,
  checkSupportFile,
  checkRepoName,
  checkTopics,
  checkContributingFile,
  checkCustomTemplates,
  checkLicenseFile,
  checkLicense,
} from '../src/checks'
import { PrimaryCheckConfig } from '../src/types'
const fs = require('fs')
const path = require('path')

describe('Health checks', () => {
  let probot: any
  let context: Context
  let mockCert: string
  let checkConfig: PrimaryCheckConfig

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
    checkConfig = {
      disabled: false,
      name: 'check-name',
      value: 15,
      infoLink: 'https://moreinfo',
    }
  })

  describe('checkDescription', () => {
    test('skips if disabled', () => {
      const config = createConfig('description', { disabled: true })
      const result = checkDescription(context, config)
      expect(result.passed).toBe(false)
      expect(result.skipped).toBe(true)
    })

    test('fails if description is missing', () => {
      const config = createConfig('description')
      context.payload.repository.description = null
      const result = checkDescription(context, config)
      expect(result.passed).toBe(false)
    })

    test('fails if description is blank', () => {
      const config = createConfig('description')
      context.payload.repository.description = ''
      const result = checkDescription(context, config)
      expect(result.passed).toBe(false)
    })

    test('passes if description exists', () => {
      const config = createConfig('description')
      context.payload.repository.description = 'This is a description'
      const result = checkDescription(context, config)
      expect(result.passed).toBe(true)
    })
  })

  describe('checkReadmeFile', () => {
    test('skips if disabled', async (done) => {
      const config = createConfig('readmeFile', { disabled: true })
      const result = await checkReadmeFile(context, config)
      expect(result.passed).toBe(false)
      expect(result.skipped).toBe(true)
      await done()
    })

    test('fails if README.md file is too short', async (done) => {
      const config = createConfig('readmeFile')

      nock('https://api.github.com')
        .get('/repos/my-org/my-repo/contents/README.md')
        .reply(200, {
          type: 'file',
          size: 1,
          content: '1',
          name: 'README.md',
        })

      const result = await checkReadmeFile(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('passes if contains meaningful README.md file', async (done) => {
      const config = createConfig('readmeFile')

      nock('https://api.github.com')
        .get('/repos/my-org/my-repo/contents/README.md')
        .reply(200, {
          type: 'file',
          size: 200,
          content: 'someContent',
          name: 'README.md',
        })

      const result = await checkReadmeFile(context, config)
      expect(result.passed).toBe(true)
      await done()
    })
  })

  describe('checkLicenseFile', () => {
    test('skips if disabled', async (done) => {
      const config = createConfig('licenseFile', { disabled: true })
      const result = await checkLicenseFile(context, config)
      expect(result.passed).toBe(false)
      expect(result.skipped).toBe(true)
      await done()
    })

    test('fails if missing license file', async (done) => {
      const config = createConfig('licenseFile')
      context.payload.repository.license = null
      const result = await checkLicenseFile(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('passes if has unrecognized license file', async (done) => {
      const config = createConfig('licenseFile')
      context.payload.repository.license = licenseOther
      const result = await checkLicenseFile(context, config)
      expect(result.passed).toBe(true)
      await done()
    })

    test('passes if has recognized license file', async (done) => {
      const config = createConfig('licenseFile')
      context.payload.repository.license = licenseISC
      const result = await checkLicenseFile(context, config)
      expect(result.passed).toBe(true)
      await done()
    })
  })

  describe('checkLicense', () => {
    test('skips if disabled', async (done) => {
      const config = createConfig('license', { disabled: true })
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(false)
      expect(result.skipped).toBe(true)
      await done()
    })

    test('fails if missing license file', async (done) => {
      const config = createConfig('license')
      context.payload.repository.license = null
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('fails if has unrecognized license file with default config', async (done) => {
      const config = createConfig('license')
      context.payload.repository.license = licenseOther
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('passes if has recognized license file with default config', async (done) => {
      const config = createConfig('license')
      context.payload.repository.license = licenseISC
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(true)
      await done()
    })

    test('fails if has recognized license file with custom config', async (done) => {
      const config = createConfig('license', { licenses: ['mit'] })
      context.payload.repository.license = licenseISC
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('passes if has recognized license file with custom config', async (done) => {
      const config = createConfig('license', { licenses: ['mit', 'isc'] })
      context.payload.repository.license = licenseISC
      const result = await checkLicense(context, config)
      expect(result.passed).toBe(true)
      await done()
    })
  })

  describe('checkTopics', () => {
    test('skips if disabled', async (done) => {
      const config = createConfig('topics', { disabled: true })
      const result = await checkTopics(context, config)
      expect(result.passed).toBe(false)
      expect(result.skipped).toBe(true)
      await done()
    })

    test('fails if missing required topic', async (done) => {
      const config = createConfig('topics', { requiredTopic: ['required1'] })

      nock('https://api.github.com')
        .get('/repos/my-org/my-repo/topics')
        .reply(200, { names: ['topic1', 'topic2', 'topic3'] })

      const result = await checkTopics(context, config)
      expect(result.passed).toBe(false)
      await done()
    })

    test('passes if contains required topic', async (done) => {
      const config = createConfig('topics', { requiredTopic: ['required1'] })

      nock('https://api.github.com')
        .get('/repos/my-org/my-repo/topics')
        .reply(200, { names: ['required1', 'topic2', 'topic3'] })

      const result = await checkTopics(context, config)
      expect(result.passed).toBe(true)
      await done()
    })
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
