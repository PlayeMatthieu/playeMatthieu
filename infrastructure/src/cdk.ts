import { App } from "aws-cdk-lib";
import {CdkDistribution} from "./stacks/cdk-distribution";
import {environment} from "../../shared/environment/environment";

const app = new App();
new CdkDistribution(app,  environment.productName + "-Distribution", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});