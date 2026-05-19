# Incident 01: Kubernetes Pod CrashLoopBackOff

## Incident Summary

One of the application pods entered CrashLoopBackOff state after deployment. The service was not responding correctly, and the application health check was failing.

## Symptoms Observed

- Pod was restarting continuously
- Application endpoint was not responding
- Kubernetes showed CrashLoopBackOff status
- Logs showed application startup failure

## Commands Used

```bash
kubectl get pods -A
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl get events --sort-by=.metadata.creationTimestamp

```
## Investigation Steps
Checked pod status using kubectl get pods.
Identified the pod in CrashLoopBackOff state.
Used kubectl describe pod to check restart count, events, image details, and environment variables.
Checked application logs using kubectl logs.
Verified whether required environment variables and secrets were correctly mounted.
Checked recent deployment changes.
Root Cause

The application was failing during startup because a required database environment variable was missing or incorrectly configured.

## Resolution
Corrected the missing environment variable in the Kubernetes manifest or Secret.
Re-applied the Kubernetes configuration.
Restarted the deployment.
Verified pod status and application health endpoint.
## Fix Commands
kubectl apply -f k8s/
kubectl rollout restart deployment/<deployment-name>
kubectl get pods
kubectl logs <pod-name>
curl http://<application-url>/health
## Validation
Pod moved to Running state.
Restart count stopped increasing.
Health check returned successful response.
Application became reachable again.
## Prevention
Add environment variable validation in deployment pipeline.
Maintain separate configuration files for staging and production.
Add monitoring alert for repeated pod restarts.
