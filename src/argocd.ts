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

  return {
    namespace,
  };
}

export { deployArgoCD };
