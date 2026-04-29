# Interview Explanation Guide

This document is intended to help explain the architectural and operational decisions made in this project during a DevOps or SRE interview.

## 1. How I designed the architecture
I chose a microservices architecture to ensure independent scalability and maintainability. 
- **Frontend** is decoupled from the backend.
- **Backend Services** are split by domain (User, Product, Cart, Order, Payment, Notification). 
- I chose **Node.js** for its asynchronous event-driven nature, which fits perfectly with an I/O heavy e-commerce platform.

## 2. How services communicate
- **Synchronous Communication:** The frontend communicates with backend services via REST APIs over HTTP.
- **Asynchronous Communication:** The Order Service communicates with the Notification Service via **RabbitMQ**. When an order is placed, an `order_created` event is published. This ensures the Order Service doesn't block waiting for an email to be sent and remains highly available even if the Notification Service is temporarily down.

## 3. How deployment works
- **Local:** `docker-compose` spins up the databases, message broker, and all services simultaneously.
- **Production (Kubernetes):** Manifests define Deployments for stateless apps and StatefulSets for databases/message brokers (though in AWS, RDS/ElastiCache are preferred). ConfigMaps and Secrets inject environment variables.

## 4. How CI/CD works
I use **GitHub Actions**. The pipeline triggers on pushes to `main`.
1. **Build & Test:** It checks out the code, installs Node.js dependencies, and runs unit tests.
2. **Security Scan:** It builds the Docker image and uses `Trivy` to scan for OS and library vulnerabilities. If critical vulnerabilities are found, the build fails.
3. **Deploy:** (Placeholder) Pushes the image to AWS ECR and runs `kubectl apply` to update the EKS cluster.

## 5. How I would troubleshoot production issues
My first step is always **Observability**. I check Grafana dashboards for anomalies in HTTP error rates, latency, or CPU/Memory spikes. If a specific service is failing, I use `kubectl logs` and `kubectl describe pod`. (See `production-debugging-scenarios.md` for specific examples).

## 6. Scaling strategy
- **Compute:** Kubernetes HPA (Horizontal Pod Autoscaler) scales stateless pods based on CPU/Memory utilization. Cluster Autoscaler scales the EC2 worker nodes.
- **Database:** RDS Read Replicas can be added for the PostgreSQL database if read traffic increases.

## 7. Security strategy
- **Containers:** All Dockerfiles create a non-root user (`appuser`) and run the application as that user to prevent privilege escalation.
- **Network:** Only the Ingress controller is exposed publicly. Microservices communicate internally via ClusterIP services.
- **Data:** Passwords are theoretically hashed (mocked here), and JWTs are used for stateless API authentication.

## 8. Monitoring strategy
- Each microservice exposes a `/metrics` endpoint using `prom-client`.
- **Prometheus** scrapes these endpoints.
- **Grafana** visualizes HTTP request rates, latency, and status codes.
