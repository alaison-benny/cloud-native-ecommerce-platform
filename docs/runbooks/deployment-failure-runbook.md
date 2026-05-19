# Deployment Failure Troubleshooting Runbook

## Purpose

This runbook explains how to investigate and resolve common deployment failures in CI/CD and Kubernetes environments.

## Common Deployment Failure Reasons

- Wrong Docker image tag
- Failed build
- Failed test stage
- Missing environment variable
- Kubernetes manifest error
- ImagePullBackOff
- Readiness probe failure
- Service port mismatch
- Insufficient CPU or memory
- Secret or ConfigMap issue

## Step 1: Check CI/CD Pipeline

For GitHub Actions:

```bash
gh run list
gh run view <run-id>
```
For Jenkins:
```bash
systemctl status jenkins
journalctl -u jenkins
```
Check:

- build stage
- test stage
- Docker build
- Docker push
- deployment stage
## Step 2: Check Kubernetes Rollout
```bash
kubectl rollout status deployment/<deployment-name>
kubectl rollout history deployment/<deployment-name>
kubectl get pods
```
## Step 3: Check Pod Events
```bash
kubectl describe pod <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp
```
## Step 4: Check Application Logs
```bash
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
```
## Step 5: Check Image
```bash
docker pull <image-name>:<tag>
kubectl describe pod <pod-name>
```

## Verify:
- image name
- image tag
- registry access
- image pull secret
## Step 6: Check Configuration
```bash
kubectl get configmap
kubectl get secret
kubectl describe deployment <deployment-name>
```
## Step 7: Rollback If Required
```bash
kubectl rollout undo deployment/<deployment-name>
kubectl rollout status deployment/<deployment-name>
```
## Final Validation
```bash
kubectl get pods
curl http://<application-url>/health
kubectl logs <pod-name>
```
## Prevention
- Use automated build validation
- Use fixed image tags
- Add deployment smoke tests
- Validate Kubernetes manifests before applying
- Maintain rollback procedure
