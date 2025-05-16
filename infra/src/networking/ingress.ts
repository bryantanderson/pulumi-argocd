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

  return {
    chart,
    namespace,
  };
}

export { deployIngressController };
