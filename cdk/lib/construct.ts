import { Construct } from 'constructs';
import { aws_ssm as SSM } from 'aws-cdk-lib';

/**
 * Create a resource for accessing SSM values (as Cloud Formation tokens to resolve on deploy).
 */
export class ParamsConstruct extends Construct {
  private path: string;

  constructor(scope: Construct, id: string, options: { path: string }) {
    super(scope, id);
    this.path = options.path;
  }

  config(key: string) {
    return SSM.StringParameter.valueForStringParameter(
      this,
      `${this.path}/${key}`
    ).toString();
  }

  secret(key: string) {
    return SSM.StringParameter.fromSecureStringParameterAttributes(this, key, {
      parameterName: `${this.path}/${key}`,
    }).stringValue;
  }
}
