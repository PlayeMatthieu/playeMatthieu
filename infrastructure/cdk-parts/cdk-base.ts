import {Stack} from 'aws-cdk-lib';

export class CdkBase {
  stack: Stack;

  domainName: string;
  region: string;

  constructor(stack: Stack, domainName: string, region = 'eu-central-1') {
    this.stack = stack;
    this.domainName = domainName;
    this.region = region;
  }
}