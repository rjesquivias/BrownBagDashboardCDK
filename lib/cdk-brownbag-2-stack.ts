import { App, Stack, StackProps } from "aws-cdk-lib";
import { createTeamDashboard } from "./widgetLib";

export class CdkBrownbag2Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiName = "mockApiName";
    const dashboardName = "BrownBagDemoDashboard";
    createTeamDashboard(this, apiName, dashboardName);
  }
}

export class CdkBrownbag2Stack2 extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiName = "mockApiName2";
    const dashboardName = "BrownBagDemoDashboard2";
    createTeamDashboard(this, apiName, dashboardName);
  }
}
