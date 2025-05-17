import * as k8s from "@pulumi/kubernetes";

function deployApps(k8sProvider: k8s.Provider) {
  const namespace = new k8s.core.v1.Namespace(
    `app-namespace`,
    {
      metadata: {
        name: `app-namespace`,
      },
    },
    {
      provider: k8sProvider,
    }
  );

  const deployment = new k8s.apps.v1.Deployment(
    `api-deployment`,
    {
      metadata: {
        name: `api-deployment`,
        namespace: namespace.metadata.name,
      },
      spec: {
        replicas: 2,
        revisionHistoryLimit: 3,
        selector: {
          matchLabels: {
            app: `api`,
          },
        },
        template: {
          metadata: {
            labels: {
              app: `api`,
            },
            namespace: namespace.metadata.name,
          },
          spec: {
            containers: [
              {
                name: `api`,
                image: `bryantandersonc/pulumi-argocd-sample-api:latest`,
                ports: [
                  {
                    protocol: "TCP",
                    containerPort: 8080,
                  },
                ],
              },
            ],
          },
        },
      },
    },
    {
      provider: k8sProvider,
      dependsOn: [namespace],
    }
  );

  const service = new k8s.core.v1.Service(
    `api-svc`,
    {
      metadata: {
        name: `api-svc`,
        namespace: namespace.metadata.name,
      },
      spec: {
        type: `ClusterIP`,
        selector: {
          app: `api`,
        },
        ports: [
          {
            protocol: "TCP",
            port: 8080,
            targetPort: 8080,
          },
        ],
      },
    },
    { provider: k8sProvider, dependsOn: [deployment] }
  );

  return {
    deployment,
    service,
  };
}

export { deployApps };
