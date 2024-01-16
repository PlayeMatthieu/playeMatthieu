import {CfnOutput, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {BlockPublicAccess, BucketAccessControl} from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins'
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class CdkDistribution extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = 'playe.be';
    const siteDomain = 'www' + '.' + domainName;

    // Create an identity to be used for allowing the distribution to access the bucket
    const identity = new cloudfront.OriginAccessIdentity(this, 'Cloudfront-OAI', {
      comment: 'OAI for Cloudfront distribution'
    });

    const zone = route53.HostedZone.fromLookup(this, 'Zone', {domainName: domainName});
    console.log(zone)

    const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: domainName,
      subjectAlternativeNames: ['*.' + domainName],
      hostedZone: zone,
      region: 'us-east-1', // Cloudfront only checks this region for certificates
    });

    certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)

    new CfnOutput(this, 'Certificate', {value: certificate.certificateArn});

// S3 bucket
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html'
    });

    // Grant access to cloudfront
    siteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [siteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(identity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    new CfnOutput(this, 'Bucket', {value: siteBucket.bucketName});

    // Cloudfront distribution that provides HTTPS
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain, domainName],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 400, responseHttpStatus: 200,
          responsePagePath: '/index.html', ttl: Duration.minutes(30)
        },
        {
          httpStatus: 403, responseHttpStatus: 200,
          responsePagePath: '/index.html', ttl: Duration.minutes(30)
        },
        {
          httpStatus: 404, responseHttpStatus: 200,
          responsePagePath: '/index.html', ttl: Duration.minutes(30)
        },
      ],
      defaultBehavior: {
        origin: new S3Origin(siteBucket, {originAccessIdentity: identity}),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    new CfnOutput(this, 'DistributionId', {value: distribution.distributionId});

    // Create a record in Route53 for the CloudFront distribution
    new route53.ARecord(this, 'WWWSiteAliasRecord', {
      zone,
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });
    //5.2 Add an 'A' record to Route 53 for 'example.com'
    new route53.ARecord(this, 'SiteAliasRecord', {
      zone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../portfolio/dist/')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}