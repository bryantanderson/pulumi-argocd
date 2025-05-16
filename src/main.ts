import * as k8s from "@pulumi/kubernetes";
import { deployArgoCD } from "./argocd/argocd";
import { getConfig } from "./config";

async function main() {
  const config = getConfig();

  const k8sProvider = new k8s.Provider("k8s-provider", {
    // Defaults to using kubeconfig at $HOME/.kube/config
    renderYamlToDirectory: config.renderYamlToDirectory,
  });

  deployArgoCD(k8sProvider);
}

main()