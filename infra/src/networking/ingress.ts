import * as k8s from "@pulumi/kubernetes";

function deployIngressController(k8sProvider: k8s.Provider) {
  const namespace = new k8s.core.v1.Namespace(
    `nginx-namespace`,
    {
      metadata: {
        name: `nginx-namespace`,
      },
    },
    {
      provider: k8sProvider,
    }
  );

  const chart = new k8s.helm.v3.Chart(
    `nginx-ingress-controller`,
    {
      chart: "ingress-nginx",
      version: "2.1.0",
      fetchOpts: {
        repo: "https://kubernetes.github.io/ingress-nginx",
      },
      namespace: namespace.metadata.name,
      // Ref: https://github.com/nginx/kubernetes-ingress/blob/main/charts/nginx-ingress/values.yaml
      values: {
        controller: {
          name: "nginx-ingress-controller",
          kind: "deployment",
        },
      },
    },
    {
      provider: k8sProvider,
      dependsOn: [namespace],
    }
  );

  new k8s.networking.v1.Ingress(
    `ingress-rules`,
    {
      metadata: {
        name: `ingress-rules`,
        namespace: namespace.metadata.name,
        annotations: {
          // Rewrites incoming URL path to "/" before sending to the backend
          "nginx.ingress.kubernetes.io/rewrite-target": "/",
        },
      },
      spec: {
        ingressClassName: "nginx",
        rules: [
          {
            // no host field to match all hostnames
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: "api-svc",
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { provider: k8sProvider, dependsOn: [chart] }
  );

  return {
    chart,
    namespace,
  };
}

export { deployIngressController };
