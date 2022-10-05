import type { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { SyncDiscord } from './components/sync-discord';
import { Maintenance } from './components/maintenance';
import { NextApp } from './components/next';
import { Vpc } from './components/vpc';
import { Docker } from './components/docker';
import { Roles } from './components/roles';
import { Secrets } from './components/secrets';
// import { Distro } from './components/distro';
import { WebhookWorker } from './components/webhook-worker';
import { SyncWorker } from './components/sync-worker';
import { PushService } from './components/push-service';
import { DockerElixir } from './components/docker-elixir';
import { environment } from './utils/env';
import { ChatSyncWorker } from './components/chat-sync-worker';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { dockerImage } = Docker();
    const { dockerImage: dockerElixir } = DockerElixir();

    const { s3AccessPolicy, mailerAccessPolicy } = Roles(this);

    const { securityGroup, vpc } = Vpc(this);

    const { secrets } = Secrets(this);

    const cluster = new cdk.aws_ecs.Cluster(this, 'linenCluster', {
      containerInsights: true,
      vpc,
    });

    // NextApp(this, {
    //   cluster,
    //   dockerImage,
    //   secrets,
    //   environment,
    //   s3AccessPolicy,
    //   mailerAccessPolicy,
    //   securityGroup,
    // });

    // Distro(this, { loadBalancer });

    PushService(this, {
      cluster,
      dockerImage: dockerElixir,
      secrets,
      environment,
      s3AccessPolicy,
      mailerAccessPolicy,
      securityGroup,
    });

    WebhookWorker(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      s3AccessPolicy,
      mailerAccessPolicy,
    });

    SyncWorker(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      s3AccessPolicy,
      mailerAccessPolicy,
    });

    ChatSyncWorker(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      s3AccessPolicy,
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
      s3AccessPolicy,
      mailerAccessPolicy,
    });

    Maintenance(this, {
      cluster,
      dockerImage,
      secrets,
      environment,
      s3AccessPolicy,
      mailerAccessPolicy,
    });
  }
}
