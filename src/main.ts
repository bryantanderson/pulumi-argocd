import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { deployArgoCD } from "./argocd/argocd";

async function main() {
  const config = new pulumi.Config();

  const renderYamlToDirectory = config.get("kubernetes:MANIFESTS_DIR") ?? "./manifests";

  const k8sProvider = new k8s.Provider("k8s-provider", {
    renderYamlToDirectory,
  });

  deployArgoCD(k8sProvider);
}

main().catch((error) => {
  console.trace(`Fatal error in main(): ${JSON.stringify(error, null, 2)}`);
});
