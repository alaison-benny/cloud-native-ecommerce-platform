# Incident 02: ImagePullBackOff During Deployment

## Incident Summary

A Kubernetes deployment failed because the pod was unable to pull the required Docker image.

## Symptoms Observed

- Pod status showed ImagePullBackOff
- Deployment did not complete
- Application was unavailable after deployment
- Kubernetes events showed image pull failure

## Commands Used

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp
docker images
docker pull <image-name>
```
## Investigation Steps
- Checked pod status after deployment.
- Found pod stuck in ImagePullBackOff state.
- Used kubectl describe pod to inspect the image pull error.
- Verified Docker image name and tag.
- Checked whether the image existed in the container registry.
- Verified image pull secret configuration if private registry was used.

## Root Cause
The deployment manifest used an incorrect Docker image tag.

## Resolution
- Corrected the image tag in the Kubernetes deployment manifest.
- Re-applied the deployment.
- Verified that the pod pulled the correct image and started successfully.

## Fix Commands
```bash

kubectl set image deployment/<deployment-name> <container-name>=<correct-image>:<tag>
kubectl rollout status deployment/<deployment-name>
kubectl get pods
```

## Validation
- Pod moved from ImagePullBackOff to Running.
- Deployment rollout completed successfully.
- Application health check passed.
## Prevention
- Use CI/CD validation to check image tag availability before deployment.
- Avoid using manual image tags.
- Use Git commit SHA-based image tagging.
