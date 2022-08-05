import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { ScopedAws } from 'aws-cdk-lib';
import { DYNAMODB_TABLE, S3_ASSETS_BUCKET } from '../../utils/env';

export function Roles(scope: Construct) {
  const { accountId, region } = new ScopedAws(scope);

  const cacheTableAccessPolicy = new cdk.aws_iam.PolicyStatement({
    actions: [
      'dynamodb:PutItem',
      'dynamodb:GetItem',
      's3:PutObject',
      's3:PutObjectAcl',
      's3:PutLifecycleConfiguration',
    ],
    resources: [
      `arn:aws:dynamodb:${region}:${accountId}:table/${DYNAMODB_TABLE}`,
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
