import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export function Vpc(scope: Construct) {
  const vpc = cdk.aws_ec2.Vpc.fromLookup(scope, 'vpc', {
    isDefault: true,
  });

  const securityGroup = new cdk.aws_ec2.SecurityGroup(
    scope,
    'fargateSecurity',
    {
      vpc,
      allowAllOutbound: true,
    }
  );

  securityGroup.addIngressRule(
    cdk.aws_ec2.Peer.anyIpv4(),
    cdk.aws_ec2.Port.tcp(80)
  );

  return { securityGroup, vpc };
}
