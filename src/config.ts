import * as pulumi from "@pulumi/pulumi";
import { Config } from "./types";

function getConfig(): Config {
  const config = new pulumi.Config();

  return {
    kubernetesContext: config.get("kubernetes:CONTEXT") ?? "default",
    renderYamlToDirectory: config.get("kubernetes:MANIFESTS_DIR") ?? "./manifests",
  };
}

export { getConfig };
