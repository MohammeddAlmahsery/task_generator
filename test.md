Download Markdown
Generate New Mission
# Intern Task Report  

---

## Project Overview  
Project Name: Nexus - Centralized Internal Tool Dashboard  
Documentation Source: Project "Nexus" Documentation PDF  

Summary:  
Project Nexus aims to develop a unified, web-based dashboard that aggregates all of Acme Corp's disparate internal tools into a single, cohesive portal. The solution will improve employee productivity and user experience by providing Single Sign-On (SSO), a customizable widget-based interface, and centralized administration. The initial MVP will integrate three core applications: LeaveApp, TicketFlow, and ExpenSense.  

---

## Intern Profile  
Name: Alex Chen  

Background Summary:  
- **CI/CD & Automation:** Experience designing and implementing multi-stage CI/CD pipelines using Jenkins and GitHub Actions, with a focus on automated testing and quality gates.  
- **Testing & Quality Assurance:** Proficient in using testing frameworks like Pytest and static analysis tools (SonarQube) to enforce code quality and prevent deployment of faulty code.  
- **Containerization & Cloud:** Strong practical skills with Docker, Kubernetes (Minikube), and AWS, including deploying and managing containerized applications.  

---

## Task Assignment  
Task Title: Enhance Backend CI/CD Pipeline with Automated Testing and Quality Gates  

Description:  
The current CI/CD pipeline for the Django backend in Project Nexus lacks automated testing and static code analysis. This task involves modifying the existing GitHub Actions workflow to integrate a robust testing stage that automatically runs unit tests (using Pytest) and a linter/static analyzer before any code is built and deployed.  

Objective:  
The final deliverable is an updated GitHub Actions workflow file submitted via a Pull Request. The new pipeline must automatically execute the backend test suite and code analysis checks, and it must fail the build—preventing deployment—if any tests or quality checks do not pass.  

Complexity Level: Intermediate  
Expected Duration: 2 weeks  

---

## Learning Opportunities  
- **Enterprise CI/CD:** Gain hands-on experience modifying a production-style CI/CD pipeline that deploys to a Kubernetes (EKS) environment.  
- **DevOps Best Practices:** Apply knowledge of quality gates, automated testing, and fail-fast principles in a real-world software project.  
- **Python Test Automation:** Deepen expertise in Pytest by integrating it into a containerized build process within a professional development workflow.  

---

## Step-by-Step Plan  
1. Preparation Stage  
   - Clone the `nexus_backend` repository.
   - Set up the local development environment using Docker to run the Django application.
   - Thoroughly review the existing `.github/workflows/deploy.yml` file to understand the current build, push, and deploy jobs.
   - Review the `Dockerfile` for the backend service.

2. Exploration Stage  
   - Research best practices for running Pytest within a Docker container during a CI process.
   - Investigate lightweight, effective static analysis tools for Python/Django projects (e.g., Flake8, Black) and how to integrate them into GitHub Actions.
   - Create a `requirements-dev.txt` file to manage testing-specific dependencies like `pytest`, `pytest-django`, and `flake8`.

3. Implementation Stage  
   - Modify the backend `Dockerfile` to include a new multi-stage build target specifically for testing. This stage will install dependencies from `requirements-dev.txt`.
   - Update the `test` job in the GitHub Actions workflow YAML file.
   - Add a new step within the `test` job to build the test-specific Docker image.
   - Add a subsequent step to run the Pytest suite inside a container using the newly built image.
   - Add a final step to run a static analysis tool like Flake8.
   - Ensure that the job is configured to exit with a failure code if either the tests or the linter fail.

4. Testing & Feedback Stage  
   - Create a new feature branch for your changes (e.g., `feature/backend-ci-testing`).
   - Intentionally write a failing test or introduce a style error to confirm the pipeline fails as expected.
   - Correct the error and push a new commit to verify the pipeline passes when the code is correct.
   - Submit a Pull Request to the `main` branch, detailing the changes and linking to the successful workflow runs.

5. Delivery Stage  
   - Once the Pull Request is approved, merge it into the `main` branch.
   - Add a brief section to the project's `README.md` explaining the new automated testing stage and how developers can run the tests locally.

---

## Resources & References  
- **Project Documentation:** `Project "Nexus" Documentation PDF`, Sections 4 (Backend Plan) and 6 (Deployment & DevOps Plan).
- **GitHub Actions Documentation:** [Official Guide to Building and testing Python](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-python)
- **Pytest Documentation:** [pytest-django Documentation](https://pytest-django.readthedocs.io/en/latest/)
- **Docker Guide:** [Testing a Django Application with Docker and Pytest](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/)

---

## Next Steps  
Upon successful completion of this task, you will have a solid foundation to:
- **Implement Code Coverage:** Investigate adding code coverage reporting to the pipeline using `pytest-cov` and a service like Codecov.
- **Introduce Security Scanning:** Explore integrating a container security scanner (e.g., Trivy, Snyk) into the pipeline to check for vulnerabilities in the Docker image.
- **Enhance Frontend Pipeline:** Apply the same principles of automated testing and quality gates to the frontend React application's CI/CD workflow.

---
## Check List
- [ ] Clone the `nexus_backend` repository.
- [ ] Successfully run the backend application locally using Docker.
- [ ] Locate and analyze the existing `deploy.yml` GitHub Actions workflow.
- [ ] Create a `requirements-dev.txt` file and add `pytest`, `pytest-django`, and `flake8`.
- [ ] Modify the `Dockerfile` to support a dedicated testing stage.
- [ ] Update the `test` job in `deploy.yml` to build the test image.
- [ ] Add a step in the `test` job to execute `pytest`.
- [ ] Add a step in the `test` job to execute `flake8`.
- [ ] Confirm the pipeline fails correctly when a test is broken.
- [ ] Confirm the pipeline passes when all tests and checks are successful.
- [ ] Create a Pull Request with your changes for review.
- [ ] Update the project's `README.md` with instructions for the new testing process.