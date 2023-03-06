import { Construct } from "constructs";
import { Deployment, Method, MockIntegration, PassthroughBehavior, RestApi, Stage } from "aws-cdk-lib/aws-apigateway";
import { aws_cloudwatch as cloudwatch, Duration } from "aws-cdk-lib";

export const createInvocatonCountWidget = (ApiName: string) => {
  return new cloudwatch.GraphWidget({
    width: 24,
    title: "Invocation Count",
    left: [
      new cloudwatch.Metric({
        metricName: "Count",
        namespace: "AWS/ApiGateway",
        dimensionsMap: { ApiName },
        statistic: "sum",
        label: "Count",
        period: Duration.seconds(30),
      }),
    ],
  });
};

export const createLatencyWidget = (
  title: string,
  statistic: string,
  label: string,
  width: number,
  ApiName: string
) => {
  const duration = Duration.seconds(30);
  const latencyMetric = new cloudwatch.Metric({
    metricName: "Latency",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName },
    statistic,
    label,
    period: duration,
  });
  return new cloudwatch.GraphWidget({
    width,
    title,
    left: [latencyMetric],
  });
};

export const create4xxWidget = (ApiName: string) => {
  const duration = Duration.seconds(30);
  const errorMetric = new cloudwatch.Metric({
    metricName: "4XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName },
    statistic: "Sum",
    label: "4XX Error Count",
    period: duration,
  });
  const errorRate = new cloudwatch.Metric({
    metricName: "4XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName },
    statistic: "Average",
    label: "4XX Error Rate",
    period: duration,
  });
  return new cloudwatch.GraphWidget({
    width: 12,
    title: "4XX Error",
    left: [errorMetric, errorRate],
  });
};

export const create5xxWidget = (ApiName: string) => {
  const duration = Duration.seconds(30);
  const errorMetric = new cloudwatch.Metric({
    metricName: "5XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName },
    statistic: "Sum",
    label: "5XX Error Count",
    period: duration,
  });
  const errorRate = new cloudwatch.Metric({
    metricName: "5XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName },
    statistic: "Average",
    label: "5XX Error Rate",
    period: duration,
  });
  return new cloudwatch.GraphWidget({
    width: 12,
    title: "5XX Error",
    left: [errorMetric, errorRate],
  });
};

export const createRestApi = (scope: Construct, ApiName: string) => {
  const restApi = new RestApi(scope, ApiName, {
    deploy: false,
  });
  restApi.root.addMethod("ANY");
  const method = restApi.root.addResource("pets").addMethod(
    "GET",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{ "statusCode": 200 }',
      },
    }),
    {
      methodResponses: [{ statusCode: "200" }],
    }
  );
  let methods: Method[] = [];
  methods.push(method);
  const deployment = new Deployment(scope, "Deployment", {
    api: restApi,
  });
  if (methods) {
    for (const method of methods) {
      deployment.node.addDependency(method);
    }
  }
  const stage = new Stage(scope, "Stage", { deployment, metricsEnabled: true });
};

export const createDashboard = (scope: Construct, id: string, dashboardName: string) => {
  return new cloudwatch.Dashboard(
    scope,
    id,
    /* all optional props */ {
      dashboardName,
      end: "end",
      periodOverride: cloudwatch.PeriodOverride.AUTO,
      start: "start",
    }
  );
};

export const createTeamDashboard = (scope: Construct, apiName: string, dashboardName: string) => {
  const restApi = createRestApi(scope, apiName);
  const dashboard = createDashboard(scope, dashboardName, dashboardName);
  const p90LatencyWidget = createLatencyWidget("P90 - Latency", "p90.00", "P90", 8, apiName);
  const p95LatencyWidget = createLatencyWidget("P95 - Latency", "p95.00", "P95", 8, apiName);
  const p99LatencyWidget = createLatencyWidget("P99 - Latency", "p99.00", "P99", 8, apiName);
  const errorRate4xxWidget = create4xxWidget(apiName);
  const errorRate5xxWidget = create5xxWidget(apiName);
  const invocationCountWidget = createInvocatonCountWidget(apiName);

  dashboard.addWidgets(
    invocationCountWidget,
    p90LatencyWidget,
    p95LatencyWidget,
    p99LatencyWidget,
    errorRate4xxWidget,
    errorRate5xxWidget
  );
};
