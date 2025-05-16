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
  // controller that actually talks to CAs, solves challenges and keeps certificates renewed
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

  // Ref: https://cert-manager.io/docs/configuration/acme/#configuration
  // configs that represent certificate authorities (CAs) able to generate signed certificates
  // by honoring certificate signing requests
  new k8s.apiextensions.CustomResource(
    `lets-encrypt-cluster-issuer`,
    {
      apiVersion: "cert-manager.io/v1",
      kind: "ClusterIssuer",
      metadata: {
        name: `lets-encrypt-cluster-issuer`,
        namespace: namespace.metadata.name,
      },
      spec: {
        acme: {
          email: "TODO",
          server: "https://acme-v02.api.letsencrypt.org/directory",
          privateKeySecretRef: {
            // This is created by CertManager
            name: `lets-encrypt-cluster-issuer-private-key`,
          },
          solvers: [
            {
              http01: {
                ingress: {
                  ingressClassName: "nginx",
                },
              },
            },
            // TODO: Maybe add a DNS01 solver for CloudFlare
          ],
        },
      },
    },
    { provider: k8sProvider, dependsOn: [chart] }
  );

  // TODO: Whatever Certificates

  return {
    chart,
    namespace,
  };
}

export { deployCertManager };
