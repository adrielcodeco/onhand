import * as cdk from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import { Container } from 'typedi'
import { Options, resourceName } from '#/app/options'

export class CognitoStack extends cdk.Stack {
  private readonly options: Options

  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, resourceName(options, 'cognito'), {
      description: '',
    })

    this.options = options

    this.createUserPool()
  }

  private createUserPool () {
    const userPoolName = resourceName(this.options, 'UserPool')
    const defaultUserPool: cognito.UserPoolProps = {
      userPoolName,
      selfSignUpEnabled: false,
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: {
        email: true,
      },
      customAttributes: {
        userId: new cognito.StringAttribute(),
      },
      passwordPolicy: {
        minLength: 6,
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
        tempPasswordValidity: cdk.Duration.days(2),
      },
    }
    const userPool = new cognito.UserPool(this, userPoolName, defaultUserPool)
    // eslint-disable-next-line no-new
    new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      groupName: `${userPoolName}-adm-group`,
      userPoolId: userPool.userPoolId,
    })
    // eslint-disable-next-line no-new
    new cognito.CfnUserPoolGroup(this, 'UsersGroup', {
      groupName: `${userPoolName}-usr-group`,
      userPoolId: userPool.userPoolId,
    })
    const client = new cognito.UserPoolClient(
      this,
      resourceName(this.options, 'UserPoolClient'),
      {
        userPool: userPool,
      },
    )

    Container.set('userPoolId', userPool.userPoolId)
    Container.set('userPoolClientId', client.userPoolClientId)
    Container.set('userPoolRegion', this.region)
  }
}
