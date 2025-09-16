# Intern Task Report  

---

## Project Overview  
Project Name: Nexus - Centralized Internal Tool Dashboard  
Documentation Source: Project "Nexus" Documentation (v1.0)  

Summary:  
Project Nexus aims to develop a unified, web-based dashboard to centralize all of Acme Corp's internal tools. The goal is to improve employee productivity and user experience by providing a single portal with Single Sign-On (SSO), a customizable interface, and centralized administration, thereby reducing management overhead.  

---

## Intern Profile  
Name: Alex Chen  

Background Summary:  
- Extensive experience with CI/CD, containerization (Docker, Kubernetes), and cloud platforms (AWS).  
- Proficient in Python, Bash, and YAML, making him well-suited for backend and infrastructure tasks.  
- Hands-on project experience implementing monitoring solutions with Prometheus and Grafana.  

---

## Task Assignment  
Task Title: Implement Prometheus Metrics for the Nexus Backend API  

Description:  
This task involves instrumenting the Django-based Nexus backend application to expose key performance metrics for monitoring. You will integrate a Prometheus client library, configure the application to expose a metrics endpoint, update the Kubernetes deployment manifests to enable metric scraping, and create a basic Grafana dashboard to visualize the data.  

Objective:  
The final deliverable is a fully functional Grafana dashboard displaying real-time performance metrics (e.g., API request latency, HTTP status code counts, error rates) from the Nexus backend service running in the Kubernetes staging environment.  

Complexity Level: Advanced  
Expected Duration: 2 weeks  

---

## Learning Opportunities  
- Applying monitoring principles in a production-like cloud environment (AWS EKS), moving beyond local Minikube setups.  
- Integrating observability tools directly into a Python/Django application framework.  
- Working with Kubernetes service discovery and annotations for real-world Prometheus integration.  

---

## Step-by-Step Plan  
1. Preparation Stage  
   - Clone the `nexus_backend` and `nexus-infrastructure` repositories.  
   - Follow the `README.md` to set up the local development environment using Docker.  
   - Gain read-only access to the staging AWS EKS cluster, Prometheus UI, and Grafana instance.  
2. Exploration Stage  
   - Research the `django-prometheus` library to understand its capabilities and integration patterns.  
   - Analyze the existing Nexus Django backend structure to identify key API endpoints and models that require monitoring.  
   - Review the existing Kubernetes manifests (`k8s/manifests/deployment.yaml`) for the backend service.  
3. Implementation Stage  
   - Add the `django-prometheus` library to the `requirements.txt` file.  
   - Update `config/settings.py` and `config/urls.py` to enable and expose the `/metrics` endpoint.  
   - Add the necessary Prometheus middleware to automatically instrument API views.  
   - Modify the `k8s/manifests/deployment.yaml` file to add the required Prometheus scrape annotations to the pod template metadata (`prometheus.io/scrape: 'true'`, `prometheus.io/path: '/metrics'`, `prometheus.io/port: '8000'`).  
4. Testing & Feedback Stage  
   - Test locally to confirm the `/metrics` endpoint is active and exporting data correctly.  
   - Create a feature branch and push your changes.  
   - Submit a Pull Request. The CI/CD pipeline will deploy your changes to the staging environment.  
   - Verify in the staging Prometheus UI that the `nexus-backend` target is being scraped successfully.  
   - Solicit feedback on your implementation from the DevOps lead.  
5. Delivery Stage  
   - Create a new dashboard in the staging Grafana instance named "Nexus Backend API Performance".  
   - Add panels to visualize key metrics like API Request Rate (per endpoint), Error Rate (5xx status codes), and Request Latency (p95/p99).  
   - Write a short summary in the project's documentation outlining the newly available metrics and linking to the Grafana dashboard.  
   - Present your work and the new dashboard to the team during the weekly review.  

---

## Next Steps  
- Review the provided "Project Nexus" documentation, focusing on the Backend and DevOps sections.  
- Schedule a brief onboarding session with the project lead to get access credentials for AWS, Grafana, and the Git repositories.  
- Begin the local environment setup for the Nexus backend service.

---

## Resources & References  
- Project "Nexus" Documentation (v1.0)  
- Official `django-prometheus` library documentation: [https://github.com/korfuri/django-prometheus](https://github.com/korfuri/django-prometheus)  
- Prometheus documentation on Kubernetes SD configurations.  
- Internal repository links: `git.acme.corp/nexus/backend.git`, `git.acme.corp/nexus/infrastructure.git`  

---

## Check List

- [x] Local development environment is set up and running.
- [ ] `django-prometheus` library is added to `requirements.txt`.
- [ ] Django application is configured to expose the `/metrics` endpoint.
- [ ] `/metrics` endpoint is verified and functional in the local environment.
- [ ] Kubernetes `deployment.yaml` is updated with correct Prometheus annotations.
- [ ] A Pull Request with the changes is submitted for review.
- [ ] Changes are successfully deployed to the staging environment.
- [ ] Prometheus target for `nexus-backend` is confirmed as "UP" in the Prometheus UI.
- [ ] A new Grafana dashboard is created with at least 3 relevant metric panels.
- [ ] Project documentation is updated with details of the new monitoring capabilities.
- [ ] A final walkthrough of the dashboard is presented to the team.