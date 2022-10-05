import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export function DockerElixir() {
  const dockerImage = new cdk.aws_ecs.AssetImage(
    path.join(__dirname, '../../../../push_service'),
    {
      buildArgs: {
        PUSH_SERVICE_KEY: process.env.PUSH_SERVICE_KEY!,
        AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL!,
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE!
      },
    }
  );
  return { dockerImage };
}
