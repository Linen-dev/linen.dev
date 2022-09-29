import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { environment } from '../../utils/env';
const { NEXT_PUBLIC_PUSH_SERVICE_URL } = environment;

export function Docker() {
  const dockerImage = new cdk.aws_ecs.AssetImage(
    path.join(__dirname, '../../../../nextjs'),
    {
      buildArgs: {
        NEXT_PUBLIC_PUSH_SERVICE_URL,
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    }
  );
  return { dockerImage };
}
