/* eslint-disable @typescript-eslint/no-unsafe-return */
import path from 'path'
import { Config } from '@onhand/iac-aws/#/app/config'

export default function ({ stage }: { stage: string }) {
  const defaultEnv: any = {
    zoneName: 'meuindicador.com',
    'dev-domainName': 'api-dev.meuindicador.com',
    'prd-domainName': 'api.meuindicador.com',
    certificateId: 'ce78b90b-2bf1-4ce3-aa8b-021a3409e531',
  }
  const getFromEnv = (key: string) => process.env[key] ?? defaultEnv[key]
  const config: Config = {
    app: {
      name: 'mif',
      type: 'api',
      src: 'src',
      openApi: 'src/4-framework/openApi',
    },
    db: {
      config: 'db/config.ts',
      migrations: 'db/migrations',
      seeds: 'db/seeds',
    },
    test: {
      verbose: true,
      bail: true,
      setup: 'tests/config/setup.ts',
      teardown: 'tests/config/teardown.ts',
      testSetup: 'tests/config/testSetup.ts',
      testRegex: ['tests/**/*.test.[tj]s'],
      ignore: ['bin', 'libs', 'config'],
    },
    build: {
      outputFolder: '#',
      webpack: {
        module: {
          rules: [
            {
              test: /\/emails\/.*\.(pug|scss)$/i,
              type: 'asset/resource',
              generator: {
                filename: (pathData: any) =>
                  `emails${(pathData.filename as string).split('emails')[1]}`,
              },
            },
          ],
        },
        resolve: {
          alias: {
            consolidate: path.resolve(__dirname, 'deps/consolidate.js'),
            'make-plural/umd/plurals': path.resolve(
              __dirname,
              'node_modules/messageformat/node_modules/make-plural/umd/plurals',
            ),
            'make-plural/umd/pluralCategories': path.resolve(
              __dirname,
              'node_modules/messageformat/node_modules/make-plural/umd/pluralCategories',
            ),
          },
        },
      },
    },
    package: {
      name: 'mif-api',
      files: [{ root: '#/', pattern: '#/**/*' }],
      outputFolder: 'deploy',
    },
    deploy: {
      verbose: true,
      ignoreErrors: false,
      awsRegion: 'us-east-2',
      files: ['deploy/*'],
    },
    cloudFront: {
      api: {
        certificateId: getFromEnv('certificateId'),
        zoneName: getFromEnv('zoneName'),
        domainName: getFromEnv(`${stage}-domainName`),
        origins: {
          apiGateway: [
            {
              cloudFormationExportName: `mif-${stage}-api-Id`,
              path: '/',
            },
          ],
        },
      },
    },
    apiGateway: {
      accessControlAllowHeaders: ['deviceId'],
    },
  }

  return config
}
