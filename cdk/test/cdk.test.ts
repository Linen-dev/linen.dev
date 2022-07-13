import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as CdkStack from '../lib/cdk-stack';
test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkStack.CdkStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);

  // Testing AWS individual resources within the stack
  // template.hasResourceProperties(...);
});
