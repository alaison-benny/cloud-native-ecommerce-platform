# Cloud-Native E-commerce Platform Implementation Plan

This plan outlines the architecture and execution strategy for building a production-style E-commerce Microservices project intended for DevOps/SRE portfolio display, targeting recruiters in Europe.

## User Review Required

> [!IMPORTANT]
> Please review the chosen technology stack below before we proceed:
> - **Backend Framework:** Node.js with Express (clean, standard REST APIs).
> - **Frontend:** Next.js (React) for a simple but professional UI.
> - **Databases:** PostgreSQL (Users, Products, Orders) and Redis (Cart).
> - **Message Broker:** RabbitMQ (for Order -> Notification events).
> - **Infrastructure/DevOps:** Docker, Kubernetes (Manifests), Terraform (AWS), GitHub Actions, Prometheus + Grafana.

## Open Questions

> [!TIP]
> 1. Do you have a preference between `npm` or `yarn` for the Node.js projects? We will default to `npm`.
> 2. For Terraform, we will generate placeholder configurations (e.g., standard AWS EKS/RDS setups). Do you want any specific AWS region pre-configured? (Defaulting to `eu-central-1` as you target Europe).

## Proposed Architecture and Steps

The project will be built incrementally.

### Phase 1: Folder Structure Initialization
We will create the core repository structure:
- `/frontend`
- `/services` (user, product, cart, order, payment, notification)
- `/infrastructure` (terraform, kubernetes)
- `/monitoring` (prometheus, grafana)
- `/docs`
- `/.github/workflows`

### Phase 2: Backend Microservices Development
For each microservice, we will create a `package.json`, a basic entry point (`server.js`), health check routes, Prometheus metrics, and basic business logic matching your requirements.
- **user-service:** JWT auth, simple user profile API.
- **product-service:** Product listing, stock info.
- **cart-service:** Redis integration, add/remove items.
- **order-service:** Order creation, RabbitMQ event publishing.
- **payment-service:** Mock payment endpoints.
- **notification-service:** RabbitMQ consumer, mock email logging.

### Phase 3: Frontend Development
- A basic Next.js frontend with UI to view products, add to cart, and place orders.
- Integration with the backend services.

### Phase 4: Dockerization and Local Environment
- `Dockerfile` for each microservice and the frontend (multi-stage where applicable).
- `docker-compose.yml` bringing up all services, PostgreSQL, Redis, and RabbitMQ.
- A `.env.example` file.

### Phase 5: Kubernetes Manifests
- Deployments, Services (ClusterIP), Ingress, ConfigMaps, Secrets (dummy values).
- HPA (Horizontal Pod Autoscaler), Liveness/Readiness probes, Resource limits/requests.

### Phase 6: CI/CD Pipeline
- GitHub Actions workflow (`.github/workflows/ci-cd.yml`) covering:
  - Linting/Testing
  - Docker image building (multi-architecture)
  - Security scanning (Trivy)
  - Kubernetes deployment placeholder.

### Phase 7: Terraform (AWS IaC)
- `main.tf`, `variables.tf`, `outputs.tf` configuring a VPC, Subnets, EKS Cluster, RDS instance, and ElastiCache Redis.

### Phase 8: Observability Configuration
- Prometheus scraping config (`prometheus.yml`).
- Sample Grafana Dashboard JSON.

### Phase 9: Documentation
- `README.md` (Main project info, recruiter-friendly sections, setup guide).
- `docs/interview-explanation.md` (Architecture, decisions, security strategy).
- `docs/production-debugging-scenarios.md` (10 real-world DevOps scenarios with symptoms, debugging steps, and fixes).

## Verification Plan

### Local Verification
- Run `docker compose up --build` to verify all services start successfully without errors.
- Test cross-service communication (e.g., creating an order publishes an event consumed by the notification service).
- Access the frontend via browser.
- Use `curl` to hit the API endpoints and ensure they return expected results (e.g., 200 OK, JSON payloads).

### CI/CD and Infrastructure Verification
- Review Terraform files for syntax and structural correctness.
- Validate Kubernetes manifests using tools or manual inspection to ensure best practices (resource limits, probes, non-root users).
