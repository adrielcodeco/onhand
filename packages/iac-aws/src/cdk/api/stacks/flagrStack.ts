import * as cdk from '@aws-cdk/core'
import * as rds from '@aws-cdk/aws-rds'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns'
import { Options, resourceName } from '#/app/options'

export class FlagrStack extends cdk.Stack {
  private readonly options: Options
  private readonly vpc = ec2.Vpc.fromLookup(this, 'vpc', { isDefault: true })

  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, resourceName(options, 'flagr'), {
      description: '',
    })

    this.options = options

    console.log(this.options.appName)

    const enableFlagr = false // TODO: add enabled in configs

    if (enableFlagr) {
      this.createMysql()
      this.createFargate()
    }
  }

  private createMysql () {
    // eslint-disable-next-line no-new
    new rds.DatabaseInstance(this, 'Instance', {
      instanceIdentifier: 'flagr',
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_21,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: rds.Credentials.fromUsername('flagrAdmin', {
        password: cdk.SecretValue.plainText('flagrAdmin'),
      }),
      databaseName: 'flagr',
      multiAz: false,
      storageType: rds.StorageType.STANDARD,
      autoMinorVersionUpgrade: false,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE,
      },
    })
  }

  private createFargate () {
    const cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc: this.vpc,
    })

    // eslint-disable-next-line no-new
    new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'MyFargateService',
      {
        cluster: cluster,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
        },
      },
    )
  }
}
