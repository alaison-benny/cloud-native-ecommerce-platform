# Incident 04: Database Connection Failure

## Incident Summary

Application was running but unable to connect to the PostgreSQL database. API requests were failing due to backend database connectivity errors.

## Symptoms Observed

- Application pod was running
- API returned 500 error
- Logs showed database connection refused or authentication failure
- Health check failed

## Commands Used

```bash
kubectl logs <app-pod>
kubectl describe pod <app-pod>
kubectl get svc
kubectl exec -it <app-pod> -- sh
nc -zv <database-host> <database-port>
psql -h <database-host> -U <username> -d <database-name>
```
## Investigation Steps
- Checked application logs.
- Verified database host, username, password, and database name.
- Checked Kubernetes Secret or environment variable values.
- Tested network connectivity from application pod to database service.
- Verified PostgreSQL service availability.
- Checked whether database container or service was running.
## Root Cause
The application was pointing to an incorrect database hostname or the PostgreSQL service was not running.

## Resolution
- Corrected database connection configuration.
- Restarted PostgreSQL service or container if required.
- Restarted application deployment.
- Verified successful database connection.
## Fix Commands
```bash
kubectl get pods
kubectl logs <postgres-pod>
kubectl rollout restart deployment/<app-deployment>
kubectl logs <app-pod>
curl http://<application-url>/health
```
## Validation
- Application connected to PostgreSQL successfully.
- API stopped returning 500 errors.
- Health check passed.
- Application functionality was restored.
## Prevention
- Add database connectivity check in startup validation.
- Monitor database service health.
- Store database credentials securely using Kubernetes Secrets.
