import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export function DockerElixir() {
  const dockerImage = new cdk.aws_ecs.AssetImage(
    path.join(__dirname, '../../../../push_service')
  );
  return { dockerImage };
}
