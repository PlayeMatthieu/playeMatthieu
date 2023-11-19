import * as cdk from 'aws-cdk-lib'
import {Construct} from 'constructs'
import {CdkDistribution} from "./cdk-parts/cdk-distribution";

export class CdkStack extends cdk.Stack {
  region = 'eu-central-1';
  domainName = '';

  distribution: CdkDistribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a distribution for the webapp
    this.distribution = new CdkDistribution(this, this.domainName, this.region);
  }
}