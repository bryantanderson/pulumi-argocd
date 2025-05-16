import * as pulumi from "@pulumi/pulumi";
import { Config } from "./types";

function getConfig(): Config {
  // Create a config object with the "kubernetes" namespace
  const kubernetesConfig = new pulumi.Config("kubernetes");

  const kubernetesContext = kubernetesConfig.get("CONTEXT");

  if (!kubernetesContext) {
    throw new Error("kubernetes:CONTEXT is a required configuration parameter");
  }

  return {
    kubernetesContext,
    renderYamlToDirectory: kubernetesConfig.get("MANIFESTS_DIR") ?? "./manifests",
  };
}

export { getConfig };
