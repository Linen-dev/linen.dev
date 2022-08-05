import type { Construct } from 'constructs';
import {
  aws_cloudfront_origins as origin,
  aws_cloudfront as cloudfront,
  aws_elasticloadbalancingv2 as elb,
} from 'aws-cdk-lib';
import { BRANCH } from '../../utils/env';

type DistroType = {
  loadBalancer: elb.ApplicationLoadBalancer;
};

export function Distro(scope: Construct, { loadBalancer }: DistroType) {
  const nextAppOrigin = new origin.LoadBalancerV2Origin(loadBalancer, {
    protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
  });

  const cdn = new cloudfront.Distribution(scope, 'linenDistro', {
    defaultBehavior: {
      origin: nextAppOrigin,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: new cloudfront.CachePolicy(scope, 'nextAppCachePolicy', {
        cookieBehavior: cloudfront.CacheCookieBehavior.none(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Host'),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
      }),
    },
    additionalBehaviors: {},
    comment: BRANCH,
  });

  return { cdn };
}
