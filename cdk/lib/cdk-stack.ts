import type { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { SyncDiscord } from './components/sync-discord';
import { Maintenance } from './components/maintenance';
// import { NextApp } from './components/next';
import { Vpc } from './components/vpc';
import { Docker } from './components/docker';
import { Roles } from './components/roles';
import { Secrets } from './components/secrets';
// import { Distro } from './components/distro';
import { QueueWorker } from './components/queue-worker';
import { QueueWorkerOnce } from './components/queue-worker-once';
import { SyncWorker } from './components/sync-worker';
import { SyncWorkerOnce } from './components/sync-worker-once';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { dockerImage } = Docker();

    const { cacheTableAccessPolicy, mailerAccessPolicy } = Roles(this);

    const { securityGroup, vpc } = Vpc(this);

    const { secrets, environment } = Secrets(this);

    const cluster = new cdk.aws_ecs.Cluster(this, 'linenCluster', {
      containerInsights: true,
      vpc,
    });

    // const { loadBalancer } = NextApp(this, {
    //   cluster,
    //   dockerImage,
    //   secrets,
    //   environment,
    //   cacheTableAccessPolicy,
    //   mailerAccessPolicy,
    //   securityGroup,
    // });

    // Distro(this, { loadBalancer });

    QueueWorker(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });

    QueueWorkerOnce(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });

    SyncWorker(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });

    SyncWorkerOnce(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });

    SyncDiscord(this, {
      cluster,
      dockerImage,
      secrets,
      environment: {
        ...environment,
        SKIP_NOTIFICATION: 'true',
      },
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });

    Maintenance(this, {
      cluster,
      dockerImage,
      secrets,
      environment: {
        ...environment,
      },
      cacheTableAccessPolicy,
      mailerAccessPolicy,
    });
  }
}
