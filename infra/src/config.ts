import * as pulumi from "@pulumi/pulumi";
import { Config } from "./types";

function getConfig(): Config {
  // Create a config object with the "kubernetes" namespace
  const kubernetesConfig = new pulumi.Config("kubernetes");

  return {
    renderYamlToDirectory: kubernetesConfig.get("MANIFESTS_DIR") ?? "../manifests",
  };
}

export { getConfig };
