#!/bin/bash

if [ ! command -v docker &>/dev/null ]; then
  echo "Docker is not installed or Docker Daemon is not running..."
  exit 1
fi

echo "Building Docker image..."

docker build --tag bryantandersonc/pulumi-argocd-sample-api:latest ./app

echo "Pushing Docker image to public Docker Hub registry..."

docker push bryantandersonc/pulumi-argocd-sample-api:latest

is_push_successful=$?

if [ $is_push_successful -ne 0 ]; then
  echo "Failed to push Docker image to public Docker Hub registry..."
  exit 1
fi

echo "Docker image published successfully!"
