/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Config } from '@onhand/iac-aws/#/app/config'

export default function ({ stage }: { stage: string }) {
  const defaultEnv: any = {
<% if (zoneName) { %>
    zoneName: '<%= zoneName %>',
    'dev-domainName': 'api-dev.<%= zoneName %>',
    'prd-domainName': 'api.<%= zoneName %>',
<% } %>
<% if (certificateId) { %>
    certificateId: '<%= certificateId %>',
<% } %>
  }
  const getFromEnv = (key: string) => process.env[key] ?? defaultEnv[key]
  const config: Config = {
    app: {
      name: '<%= projectName %>',
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
      ignore: ['bin', 'config'],
    },
    build: {
      outputFolder: '#',
    },
    package: {
      name: '<%= projectName %>-api',
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
              cloudFormationExportName: `<%= projectName %>-${stage}-api-Id`,
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
