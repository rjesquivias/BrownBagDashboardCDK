import { Construct } from "constructs";
import { Deployment, Method, MockIntegration, PassthroughBehavior, RestApi, Stage } from "aws-cdk-lib/aws-apigateway";
import { aws_cloudwatch as cloudwatch, Duration } from "aws-cdk-lib";

const mockApiName = "mockApiName";

export const createInvocatonCountWidget = () => {
  return new cloudwatch.GraphWidget({
    width: 24,
    title: "Invocation Count",
    left: [
      new cloudwatch.Metric({
        metricName: "Count",
        namespace: "AWS/ApiGateway",
        dimensionsMap: { ApiName: mockApiName },
        statistic: "sum",
        label: "Count",
        period: Duration.seconds(30),
      }),
    ],
  });
};

export const createLatencyWidget = (title: string, statistic: string, label: string, width: number) => {
  const duration = Duration.seconds(30);
  const latencyMetric = new cloudwatch.Metric({
    metricName: "Latency",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName: mockApiName },
    statistic,
    label,
    period: duration,
  });
  /*
  const fillExpression = new cloudwatch.MathExpression({
    expression: "FILL(METRICS(), 0)",
    usingMetrics: { m1: latencyMetric },
    period: duration,
  });
  */
  return new cloudwatch.GraphWidget({
    width,
    title,
    left: [latencyMetric],
  });
};

export const create4xxWidget = () => {
  const duration = Duration.seconds(30);
  const errorMetric = new cloudwatch.Metric({
    metricName: "4XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName: mockApiName },
    statistic: "Sum",
    label: "4XX Error Count",
    period: duration,
  });
  const errorRate = new cloudwatch.Metric({
    metricName: "4XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName: mockApiName },
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

export const create5xxWidget = () => {
  const duration = Duration.seconds(30);
  const errorMetric = new cloudwatch.Metric({
    metricName: "5XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName: mockApiName },
    statistic: "Sum",
    label: "5XX Error Count",
    period: duration,
  });
  const errorRate = new cloudwatch.Metric({
    metricName: "5XXError",
    namespace: "AWS/ApiGateway",
    dimensionsMap: { ApiName: mockApiName },
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

export const createRestApi = (scope: Construct) => {
  const restApi = new RestApi(scope, mockApiName, {
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

export const createDashboard = (scope: Construct) => {
  return new cloudwatch.Dashboard(
    scope,
    "MyDashboard",
    /* all optional props */ {
      dashboardName: "BrownBagDemoDashboard",
      end: "end",
      periodOverride: cloudwatch.PeriodOverride.AUTO,
      start: "start",
    }
  );
};
