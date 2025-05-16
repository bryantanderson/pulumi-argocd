import * as k8s from "@pulumi/kubernetes";

function deployArgoCD(k8sProvider: k8s.Provider) {
  const namespace = new k8s.core.v1.Namespace(
    "argocd",
    {
      metadata: {
        name: "argocd",
      },
    },
    { provider: k8sProvider }
  );

  const chart = new k8s.helm.v3.Chart(
    "argocd",
    {
      chart: "argo-cd",
      version: "8.0.0",
      fetchOpts: {
        repo: "https://argoproj.github.io/argo-helm",
      },
      namespace: namespace.metadata.name,
      // Ref: https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml
      values: {
        nameOverride: "argocd",
        fullnameOverride: "argocd",
        namespaceOverride: namespace.metadata.name,
        openshift: {
          enabled: false,
        },
        crds: {
          install: true,
          keep: false,
        },
        global: {
          domain: "argocd.bryantanderson.github.io",
          revisionHistoryLimit: 3,
          image: {
            repository: "quay.io/argoproj/argocd",
            imagePullPolicy: "IfNotPresent",
          },
          addPrometheusAnnotations: true,
        },
        configs: {
          cm: {
            create: true,
            "exec.enabled": true,
          },
        },
      },
    },
    { provider: k8sProvider }
  );

  return {
    chart,
    namespace,
  };
}

export { deployArgoCD };
