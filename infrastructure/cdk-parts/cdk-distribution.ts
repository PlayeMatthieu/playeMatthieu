import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import {CdkBase} from "./cdk-base";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";

export class CdkDistribution extends CdkBase {

  public url: string;

  constructor(stack: cdk.Stack, domainName: string, region: string) {
    super(stack, domainName, region);

    // Create an identity to be used for allowing the distribution to access the S3 bucket
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this.stack, 'CloudFrontOAI', {
      comment: 'OAI for CloudFront to access S3'
    });

    const distributionBucket = this.createDistributionBucket("distribution", cloudfrontOAI);
    this.url = this.createDistribution(this.domainName, cloudfrontOAI, distributionBucket);
  };

  createDistributionBucket(name = "distribution", cloudfrontOAI: cloudfront.OriginAccessIdentity): s3.Bucket {

    // Content bucket for our site, no public access
    const distributionBucket = new s3.Bucket(this.stack, name, {
      bucketName: name,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      /**
       * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new bucket, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
       */
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      /**
       * For sample purposes only, if you create an S3 bucket then populate it, stack destruction fails.  This
       * setting will enable full cleanup .
       */
      autoDeleteObjects: true
    });

    // Grant access to cloudfront
    distributionBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [distributionBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    new cdk.CfnOutput(this.stack, "distribution", {value: distributionBucket.bucketName});
    return distributionBucket;
  }

  createDistribution(domain: string, cloudfrontOAI: cloudfront.OriginAccessIdentity, bucket: cdk.aws_s3.Bucket): string {
    // get the DNS zone for the domain
    const zone = route53.HostedZone.fromLookup(this.stack, 'Zone', { domainName: domain });

    const siteDomain = domain;
    // Add extra domains if needed
    const extras: Array<string> = [];
    // if (this.prefix === "blueprod") {
    //   extras.push(domain);
    // }

    // TLS certificate
    const certificate = new acm.DnsValidatedCertificate(this.stack, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1', // this.region -> did not work Cloudfront needs 'us-east-1' for certificates.
      subjectAlternativeNames: extras
    });

    // Wait until the new ACM certificate has been updated to have a region parameter
    // const certificate = new acm.Certificate(this, 'SiteCertificate', {
    //   domainName: siteDomain,
    //   region: 'us-east-1', // this.region -> did not work Cloudfront needs 'us-east-1' for certificates.
    //   subjectAlternativeNames: extras,
    //   validation: acm.CertificateValidation.fromDns(this.zone)
    // });
    new cdk.CfnOutput(this.stack, 'certificate', { value: certificate.certificateArn });

    // const myResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, this.prefix+'ResponseHeadersPolicy', {
    //   responseHeadersPolicyName: this.prefix+'securityHeadersPolicy',
    //   comment: 'Security Headers Policy for Security Self Assessment',
    //   securityHeadersBehavior: {
    //     // contentSecurityPolicy: { contentSecurityPolicy: 'default-src https:;', override: true },
    //     // contentTypeOptions: { override: true },
    //     // frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
    //     // referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER, override: true },
    //     strictTransportSecurity: { accessControlMaxAge: cdk.Duration.seconds(600), includeSubdomains: true, override: true }
    //   }
    // });

    // Make CloudFront distribution
    const distribution = new cloudfront.Distribution(this.stack, 'Distribution', {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain], // , ...extras
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses:[
        { httpStatus: 400, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }
      ],
      defaultBehavior: {
        origin: new S3Origin(bucket, {originAccessIdentity: cloudfrontOAI}),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // responseHeadersPolicy: myResponseHeadersPolicy
      },
    });
    // Apple JSON file ?
    // distribution.addBehavior(pathPattern: string, origin: IOrigin, behaviorOptions?: AddBehaviorOptions): void;
    /*
    Amazon CloudFront supports adding custom headers to specific file types, without using Lambda functions, by creating a behavior with a custom "Response headers policy" and origin override checked in the policy.

    In CloudFront navigate to the "Behaviors" tab and click "Create Behavior"
    Create CloudFront Behavior

    Specify the file types you want to target in "Path pattern", f.e. .js files.
    Add *.js in "Path pattern"

    Scroll down to "Response header policy" and click "Create policy"
    Click "Create policy" in "Response header policy"

    A new tab opens, click "Add Header" in "Custom Headers", set key to "Content-Type" and value to "application/javascript", click the checkbox "Origin override", then click "Create"
    Create a custom header in the new tab with "Origin override" checked

    Navigate back to the tab in which the CloudFront Behavior is created and search for the newly created response header policy (you need to refresh the selection box first), then click "Create Behavior".
    All requests through the CloudFront CDN to .js files should now have the "Content-Type: application/javascript" response header.
    */


    new cdk.CfnOutput(this.stack, 'distributionId', { value: distribution.distributionId });

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this.stack, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: zone
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this.stack, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset("../client/dist/")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });

    let dsrv = 'https://' + siteDomain;
    new cdk.CfnOutput(this.stack, "website", {value: (dsrv[dsrv.length-1] === "/") ? dsrv.slice(0, -1) : dsrv});
    return dsrv;
  }

}