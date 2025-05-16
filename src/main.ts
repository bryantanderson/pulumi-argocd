import * as k8s from "@pulumi/kubernetes";
import { deployArgoCD } from "./argocd";
import { getConfig } from "./config";

async function main() {
  const config = getConfig();

  const k8sProvider = new k8s.Provider("k8s-provider", {
    // Defaults to using kubeconfig at $HOME/.kube/config
    renderYamlToDirectory: config.renderYamlToDirectory,
  });

  deployArgoCD(k8sProvider);

  // Dummy ConfigMap to test ArgoCD sync behavior
  if (process.env.DUMMY_CONFIG_MAP_ENABLED) {
    new k8s.core.v1.ConfigMap(
      `dummy-config-map`,
      {
        metadata: {
          name: `dummy-config-map`,
          namespace: "default",
        },
        data: {
          "dummy-key": "dummy-value",
        },
      },
      { provider: k8sProvider }
    );
  }
}

main();
