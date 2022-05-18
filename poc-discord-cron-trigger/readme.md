## discord-cron-trigger

it is a very simple cronjob that runs on AWS

### how it works

AWS Event Rule triggers a lambda function every day at 0hs of GMT-0 timezone.
The Lambda function make a http get request to our API (served on aws fargate/container service).
Our API query our database for all discord communities and dispatch the sync process for each one.
This process is asynchronous.

### how to deploy

1. the deployment is manually, you should go to aws console: https://console.aws.amazon.com/cloudformation/home
2. Create a stack (with new resources)
3. Choose 'template is ready' for 'Prepare template' option.
4. For 'Specify template' choose 'Upload a template file'.
5. Upload the 'template.yml' file from 'poc-discord-cron-trigger' folder.
6. Hit 'Next'.
7. For 'Stack name' you can choose any name, for instance: 'Discord-CronJob-Stage'
8. On parameters, you should set our API hostname that will be use on the lambda.
9. On 'ApiSyncUri' type our hostname, for instance: 'linen-san.ngrok.io'
10. Hit 'Next', and 'next' again.
11. Check the checkbox 'I acknowledge that AWS CloudFormation might create IAM resources with custom names.'
12. And 'Create Stack' button.

### cloudformation stack

- Logs: for lambda execution output
- Role: lambda execution role to allow it to write logs
- Lambda Function: in line code, very simple function that make a http get request to our fargate service
- Event Rule: a cron thats trigger our lambda
- Lambda Permission: to allow the event rule call the lambda function.
