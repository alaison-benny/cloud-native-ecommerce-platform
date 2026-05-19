# Kubernetes Pod Debugging Runbook

## Purpose

This runbook explains the standard steps used to troubleshoot Kubernetes pod issues in a production support environment.

## Common Pod Issues

- CrashLoopBackOff
- ImagePullBackOff
- Pending pod
- ContainerCreating stuck
- OOMKilled
- Running but application not responding
- Frequent restarts

## Step 1: Check Pod Status

```bash
kubectl get pods -A
kubectl get pods -n <namespace>
```
## Check:

- pod status
- restart count
- age
- namespace
- node placement
## Step 2: Describe Pod
```bash
kubectl describe pod <pod-name> -n <namespace>
```

## Check:

- events
- image name
- environment variables
- volume mounts
- restart count
- node scheduling issues
- readiness/liveness probe failures
## Step 3: Check Logs
```bash
kubectl logs <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
```

Use ```bash
 --previous ``` when the pod keeps restarting.

## Step 4: Check Events
```bash
kubectl get events -n <namespace> --sort-by=.metadata.creationTimestamp
```
Look for:

- failed scheduling
- image pull errors
- mount errors
- probe failures
- resource issues
## Step 5: Check Resource Usage
```bash
kubectl top pods -n <namespace>
kubectl top nodes
```
Look for:

- high CPU
- high memory
- OOMKilled events
## Step 6: Check Deployment Rollout
```bash
kubectl rollout status deployment/<deployment-name> -n <namespace>
kubectl rollout history deployment/<deployment-name> -n <namespace>
```
## Step 7: Restart Deployment If Required
```bash
kubectl rollout restart deployment/<deployment-name> -n <namespace>
```
## Step 8: Rollback If Required
```bash
kubectl rollout undo deployment/<deployment-name> -n <namespace>
```
## Final Validation
```bash
kubectl get pods -n <namespace>
kubectl logs <pod-name> -n <namespace>
curl http://<application-url>/health
```
## Escalation Criteria

Escalate to DevOps or Engineering team if:

- repeated crashes continue after rollback
- application code error is confirmed
- database migration issue is found
- infrastructure-level issue is suspected
- production impact is high
