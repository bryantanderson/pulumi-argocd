import * as k8s from "@pulumi/kubernetes";

function deployCertManager(k8sProvider: k8s.Provider) {
  const namespace = new k8s.core.v1.Namespace(
    `cert-manager-namespace`,
    {
      metadata: {
        name: "cert-manager-namespace",
      },
    },
    { provider: k8sProvider }
  );

  // Ref: https://artifacthub.io/packages/helm/cert-manager/cert-manager
  const chart = new k8s.helm.v3.Chart(
    `cert-manager`,
    {
      chart: "cert-manager",
      version: "1.17.2",
      fetchOpts: {
        repo: "https://charts.jetstack.io",
      },
      namespace: namespace.metadata.name,
      values: {
        crds: {
          keep: true,
          enabled: true,
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

export { deployCertManager };
