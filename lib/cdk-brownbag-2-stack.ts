import { App, Stack, StackProps } from "aws-cdk-lib";
import {
  create4xxWidget,
  create5xxWidget,
  createDashboard,
  createInvocatonCountWidget,
  createLatencyWidget,
  createRestApi,
} from "./widgetLib";

export class CdkBrownbag2Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const restApi = createRestApi(this);
    const dashboard = createDashboard(this);
    const p90LatencyWidget = createLatencyWidget("P90 Latency", "p90.00", "P90", 8);
    const p95LatencyWidget = createLatencyWidget("P95 Latency", "p95.00", "P95", 8);
    const p99LatencyWidget = createLatencyWidget("P99 Latency", "p99.00", "P99", 8);
    const errorRate4xxWidget = create4xxWidget();
    const errorRate5xxWidget = create5xxWidget();
    const invocationCountWidget = createInvocatonCountWidget();

    dashboard.addWidgets(
      invocationCountWidget,
      p90LatencyWidget,
      p95LatencyWidget,
      p99LatencyWidget,
      errorRate4xxWidget,
      errorRate5xxWidget
    );
  }
}
