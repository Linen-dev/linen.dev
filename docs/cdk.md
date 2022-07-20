# Welcome to Linen.dev CDK TypeScript project

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Deploy to AWS

First setup [AWS-CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configure](First setup [AWS-CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and configure it https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
) it for your AWS account.

Increment the version for the app:

```bash
export APP_VERSION=v5
```

From the root folder of the project build the production docker image:

```bash
# This is required only for MacOs with M1 CPU
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

```bash
docker build -t linen-dev:${APP_VERSION} . --no-cache
```

Login your docker to AWS repository:

```bash
aws ecr get-login-password \
--region us-east-1 | docker login \
--username AWS \
--password-stdin 775327867774.dkr.ecr.us-east-1.amazonaws.com
```

Tag and push the image to the AWS repository:

```bash
docker tag linen-dev:${APP_VERSION} 775327867774.dkr.ecr.us-east-1.amazonaws.com/linen-dev:${APP_VERSION}
docker push 775327867774.dkr.ecr.us-east-1.amazonaws.com/linen-dev:${APP_VERSION}
```

Go to `cdk` folder and run:

```bash
npm install
```

Build the deployment:

```bash
npm run build
```

Deploy the stack:

```bash
npm run cdk deploy
```
