import { App } from "aws-cdk-lib";
import {CdkDistribution} from "./stacks/cdk-distribution";

const app = new App();
new CdkDistribution(app, "CdkDistribution", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});