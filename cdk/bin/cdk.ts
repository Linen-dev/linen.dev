#!/usr/bin/env node

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { stackName, account, region } from '../lib/utils/env';

const app = new cdk.App();
new CdkStack(app, stackName, {
  env: {
    account,
    region,
  },
  // For more information about setting up the stack environment,
  // see https://docs.aws.amazon.com/cdk/latest/guide/environments.html
});
