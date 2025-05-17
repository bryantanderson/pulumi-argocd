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

  // Ref: https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials
  new k8s.core.v1.Secret(
    "argocd-repo-ssh-secret",
    {
      metadata: {
        name: "repo-secret",
        namespace: namespace.metadata.name,
        labels: {
          "argocd.argoproj.io/secret-type": "repo-creds",
        },
      },
      stringData: {
        type: "git",
        url: "ssh://git@github.com/bryantanderson/pulumi-argocd.git",
        sshPrivateKey: process.env.GITHUB_SSH_PRIVATE_KEY || "",
      },
    },
    { provider: k8sProvider, dependsOn: [namespace] }
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
          },
          params: {
            "server.insecure": true,
          },
          secret: {
            createSecret: true,
            argocdServerAdminPassword: process.env.ARGO_CD_SERVER_ADMIN_PASSWORD_BCRYPT_HASH,
          },
        },
      },
    },
    { provider: k8sProvider, dependsOn: [namespace] }
  );

  // Ref: https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications
  // Full configuration in ./application.yaml
  new k8s.apiextensions.CustomResource(
    "argocd-pulumi-application",
    {
      apiVersion: "argoproj.io/v1alpha1",
      kind: "Application",
      metadata: {
        name: "argocd-pulumi-application",
        namespace: namespace.metadata.name,
      },
      spec: {
        project: "default",
        revisionHistoryLimit: 10,
        source: {
          repoURL: "ssh://git@github.com/bryantanderson/pulumi-argocd.git",
          targetRevision: "HEAD",
          path: "infra/manifests",
          directory: {
            recurse: true,
          },
        },
        destination: {
          server: "https://kubernetes.default.svc",
          namespace: "default",
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true,
            allowEmpty: false,
          },
          syncOptions: ["CreateNamespace=true"],
          retry: {
            limit: 10,
            backoff: {
              duration: "5s",
              factor: 2,
              maxDuration: "10m",
            },
          },
        },
      },
    },
    {
      provider: k8sProvider,
    }
  );

  return {
    chart,
    namespace,
  };
}

export { deployArgoCD };
