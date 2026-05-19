# Incident 03: NGINX 502 Bad Gateway

## Incident Summary

Users were receiving 502 Bad Gateway errors while accessing the application through NGINX or ingress.

## Symptoms Observed

- Browser displayed 502 Bad Gateway
- Application pods were running
- Backend service was not reachable through ingress
- NGINX logs showed upstream connection failure

## Commands Used

```bash
kubectl get pods
kubectl get svc
kubectl describe svc <service-name>
kubectl get ingress
kubectl describe ingress <ingress-name>
kubectl logs <nginx-ingress-controller-pod>
curl -I http://<service-name>
curl http://<pod-ip>:<port>/health
```
## Investigation Steps
- Checked if application pods were running.
- Checked service configuration and exposed ports.
- Verified ingress backend service name and port.
- Checked NGINX ingress controller logs.
- Tested direct service connectivity.
- Compared container port, service port, and targetPort.
## Root Cause
The Kubernetes service targetPort did not match the actual container port.

## Resolution
- Corrected the service targetPort.
- Re-applied the Kubernetes service manifest.
- Verified routing through ingress.
## Fix Commands
```bash
kubectl apply -f k8s/service.yaml
kubectl describe svc <service-name>
kubectl get endpoints <service-name>
curl -I http://<application-url>
```
## Validation
- Service endpoints were correctly populated.
- Ingress routing started working.
- Application returned HTTP 200 response.
- 502 error was resolved.
## Prevention
- Validate port mapping before deployment.
- Include service connectivity checks in deployment checklist.
- Monitor ingress 5xx errors.
