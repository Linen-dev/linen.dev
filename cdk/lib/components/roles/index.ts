import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { environment } from '../../utils/env';
const { S3_ASSETS_BUCKET } = environment;

export function Roles(scope: Construct) {
  const cacheTableAccessPolicy = new cdk.aws_iam.PolicyStatement({
    actions: [
      's3:PutObject',
      's3:PutObjectAcl',
      's3:PutLifecycleConfiguration',
    ],
    resources: [
      `arn:aws:s3:::${S3_ASSETS_BUCKET}`,
      `arn:aws:s3:::${S3_ASSETS_BUCKET}/*`,
    ],
  });

  const mailerAccessPolicy = new cdk.aws_iam.PolicyStatement({
    actions: ['ses:SendRawEmail'],
    resources: [`*`],
  });

  return { cacheTableAccessPolicy, mailerAccessPolicy };
}
