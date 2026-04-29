# Production Debugging Scenarios

This document outlines 10 realistic production scenarios that an SRE or DevOps Engineer might face when managing this e-commerce platform.

## 1. Pod CrashLoopBackOff
**Symptoms:** A service pod (e.g., `user-service`) constantly restarts and is marked as `CrashLoopBackOff`.
**Commands:** 
- `kubectl get pods -n ecommerce`
- `kubectl describe pod user-service-xxx -n ecommerce`
- `kubectl logs user-service-xxx -n ecommerce --previous`
**Root Cause:** The application is throwing an unhandled exception on startup, often due to a missing environment variable or failed database connection.
**Fix:** Add the missing environment variable to the `ecommerce-config` ConfigMap or fix the database connection string.
**Prevention:** Implement proper readiness probes that fail gracefully, and use linter/validation for environment variables on app startup.

## 2. ImagePullBackOff
**Symptoms:** New deployment is stuck; pods remain in `ImagePullBackOff` or `ErrImagePull` state.
**Commands:**
- `kubectl describe pod frontend-xxx -n ecommerce`
**Root Cause:** The Kubernetes node cannot pull the Docker image because the image tag doesn't exist, or the ECR repository credentials have expired.
**Fix:** Verify the image tag in ECR. Ensure the IAM role attached to the EKS worker nodes has the `AmazonEC2ContainerRegistryReadOnly` policy.
**Prevention:** CI/CD pipeline should verify the image push success before updating the deployment manifest.

## 3. Database connection failure
**Symptoms:** Users cannot log in or view products. HTTP 500 errors spike in Grafana.
**Commands:**
- `kubectl logs -l app=user-service -n ecommerce | grep "error"`
**Root Cause:** The PostgreSQL database hit its `max_connections` limit, or the network security group between EKS and RDS changed.
**Fix:** Restart the offending pods to drop hanging connections. Increase `max_connections` in RDS or implement a connection pooler like PgBouncer.
**Prevention:** Use a connection pooling library in Node.js (`pg` pool) and set reasonable timeout limits.

## 4. Service discovery issue
**Symptoms:** The `frontend` pod logs show `getaddrinfo ENOTFOUND product-service`.
**Commands:**
- `kubectl exec -it frontend-xxx -n ecommerce -- nslookup product-service`
**Root Cause:** CoreDNS is failing, or the `product-service` Service was accidentally deleted.
**Fix:** Reapply the Kubernetes service manifest (`kubectl apply -f 03-microservices.yaml`). Check CoreDNS logs.
**Prevention:** Restrict RBAC permissions so developers cannot accidentally delete Services.

## 5. Ingress 502/503 Errors
**Symptoms:** Users see a 502 Bad Gateway or 503 Service Unavailable when hitting the main URL.
**Commands:**
- `kubectl get ingress -n ecommerce`
- `kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx`
**Root Cause:** 502 usually means the backend pods are rejecting connections (e.g., port mismatch). 503 means no endpoints are available (all pods failed readiness probes).
**Fix:** Fix the readiness probe failure in the backend pods, or correct the `targetPort` in the Ingress/Service manifests.
**Prevention:** Thoroughly test ingress rules in a staging environment before prod deployment.

## 6. Redis timeout
**Symptoms:** Adding items to the cart takes a very long time and sometimes fails.
**Commands:**
- `kubectl logs -l app=cart-service -n ecommerce`
**Root Cause:** Network latency to ElastiCache, or Redis is executing a long-running synchronous command (e.g., `KEYS *`).
**Fix:** Identify the long-running query via Redis CLI (`SLOWLOG GET`). Restart the `cart-service` pods if connections are hanging.
**Prevention:** Use appropriate Redis commands (e.g., `SCAN` instead of `KEYS`) and set proper connect/read timeouts in the Redis Node.js client.

## 7. RabbitMQ consumer lag
**Symptoms:** Orders are placed successfully, but confirmation emails are delayed by hours.
**Commands:**
- Access RabbitMQ Management UI (`http://localhost:15672`). Check the queue length for `order_created`.
**Root Cause:** The `notification-service` cannot process events fast enough, or it crashed and the queue is backing up.
**Fix:** Scale up the `notification-service` deployment (`kubectl scale deployment notification-service --replicas=5 -n ecommerce`).
**Prevention:** Implement Kubernetes HPA based on custom RabbitMQ queue length metrics using KEDA.

## 8. High CPU / HPA scaling
**Symptoms:** Node.js event loop lag spikes, response times degrade, and HPA scales up pods to the maximum limit.
**Commands:**
- `kubectl top pods -n ecommerce`
- `kubectl get hpa -n ecommerce`
**Root Cause:** A sudden spike in traffic, or a CPU-intensive operation (e.g., synchronous JSON parsing of massive payloads) blocking the main thread.
**Fix:** Temporarily increase the HPA `maxReplicas` limit. Investigate code for synchronous blocks.
**Prevention:** Implement rate limiting at the Ingress layer. Profile Node.js applications to find CPU bottlenecks.

## 9. Memory OOMKilled
**Symptoms:** Pods restart abruptly with the reason `OOMKilled`.
**Commands:**
- `kubectl describe pod product-service-xxx -n ecommerce | grep -A 2 "State:"`
**Root Cause:** The Node.js application is leaking memory, eventually hitting the Kubernetes memory limit (e.g., 256Mi).
**Fix:** Temporarily increase the memory limit in the deployment. Capture a heap snapshot to find the leak.
**Prevention:** Run load tests in staging. Ensure memory requests/limits are set properly so Kubernetes can schedule pods effectively without killing them prematurely.

## 10. Failed deployment rollback
**Symptoms:** A new deployment of `order-service` introduces a bug. You need to revert immediately.
**Commands:**
- `kubectl rollout history deployment/order-service -n ecommerce`
- `kubectl rollout undo deployment/order-service -n ecommerce`
**Root Cause:** Human error in the code that passed CI/CD.
**Fix:** Execute the `rollout undo` command to immediately revert to the previous ReplicaSet.
**Prevention:** Implement Canary deployments or Blue/Green deployments using tools like ArgoRollouts or Flagger.
