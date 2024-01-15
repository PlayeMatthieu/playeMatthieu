import * as cdk from "aws-cdk-lib";
import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins'
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import {environment} from "../../../shared/environment/environment";

export class CdkDistribution extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create an identity to be used for allowing the distribution to access the bucket
    const identity = new cloudfront.OriginAccessIdentity(this, environment.productName + '.Cloudfront-OAI', {
      comment: 'OAI for Cloudfront distribution'
    });

    // Create distribution
    const distributionBucket = this.createDistributionBucket("distribution", identity);

    // Create distribution
    this.createDistribution("playe.be", identity, distributionBucket);

  }

  createDistributionBucket(name: string, cloudfrontOAI: cloudfront.OriginAccessIdentity): s3.Bucket {
    // Content bucket for our site, no public access
    const distributionBucket = new s3.Bucket(this, environment.productName + "." + name, {
      bucketName: environment.productName + "." + name,
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

    new cdk.CfnOutput(this, "distribution", {value: distributionBucket.bucketName});
    return distributionBucket;
  }

  createDistribution(domain: string, cloudfrontOAI: cloudfront.OriginAccessIdentity, bucket: cdk.aws_s3.Bucket): string {
    // get the DNS zone for the domain
    const zone = route53.HostedZone.fromLookup(this, 'Zone', {domainName: domain});
    const siteDomain = domain;

    // TLS certificate
    const certificate = new acm.Certificate(this, environment.productName + '.Certificate', {
      domainName: siteDomain,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    new cdk.CfnOutput(this, 'certificate', {value: certificate.certificateArn});

    // Make CloudFront distribution
    const distribution = new cloudfront.Distribution(this, environment.productName + '.Distribution', {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {httpStatus: 400, responseHttpStatus: 200, responsePagePath: '/index.html'},
        {httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html'},
        {httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html'}
      ],
      defaultBehavior: {
        origin: new S3Origin(bucket, {originAccessIdentity: cloudfrontOAI}),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // responseHeadersPolicy: myResponseHeadersPolicy
      },
    });

    new cdk.CfnOutput(this, 'distributionId', {value: distribution.distributionId});

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, environment.productName + '.SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: zone
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, environment.productName + '.DeployWithInvalidation', {
      sources: [s3deploy.Source.asset("../portfolio/dist/")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });

    let dsrv = 'https://' + siteDomain;
    new cdk.CfnOutput(this, "website", {value: (dsrv[dsrv.length - 1] === "/") ? dsrv.slice(0, -1) : dsrv});
    return dsrv;
  }
}