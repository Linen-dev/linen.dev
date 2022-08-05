import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

export function Docker() {
  const dockerImage = new cdk.aws_ecs.AssetImage(
    path.join(__dirname, '../../../../nextjs'),
    {
      buildArgs: {
        DATABASE_URL: process.env.DATABASE_URL as string, // this env will be avail inside the codebuild
      },
    }
  );
  return { dockerImage };
}
