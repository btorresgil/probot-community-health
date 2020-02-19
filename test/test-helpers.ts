import { Application } from 'probot'
import cacheManager from 'cache-manager'
import * as R from 'ramda'

import { defaultConfig } from '../src/config'
import { AppConfig, ChecksConfig } from '../src/types'

const cache = cacheManager.caching({ store: 'memory', ttl: 0 })

export function newApp(): Application {
  return new Application({
    app: {
      getInstallationAccessToken: jest.fn().mockResolvedValue('test'),
      getSignedJsonWebToken: jest.fn().mockReturnValue('test'),
    },
    cache,
  })
}

export function createApp(appFn?: any) {
  const app = newApp()
  appFn && appFn(app)
  return app
}

export function createConfig<K extends keyof ChecksConfig>(
  section: K,
  extra?: any,
): AppConfig {
  const config = R.clone(defaultConfig)
  config.checks[section] = { ...config.checks[section], ...extra }
  return config
}
