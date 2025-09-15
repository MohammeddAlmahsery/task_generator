# Intern Task Report

---

## Project Overview
Project Name: Nexus - Centralized Internal Tool Dashboard
Documentation Source: Project "Nexus" Documentation v1.0

Summary:
Project Nexus is a web-based dashboard designed to aggregate all of Acme Corp's internal tools into a single, unified portal. The primary goals are to improve employee productivity and user experience by providing a consistent interface with Single Sign-On (SSO) and centralized administration.

---

## Intern Profile
Name: Alex Chen

Background Summary:
- Strong experience with CI/CD tools, particularly GitHub Actions and Jenkins.
- Proficient in containerization (Docker) and orchestration (Kubernetes).
- Specialized knowledge in software testing, including Pytest, static analysis (SonarQube), and integrating quality gates into pipelines.

---

## Task Assignment
Task Title: Enhance Backend CI/CD Pipeline with Automated Quality Gates

Description:
The intern will augment the existing GitHub Actions CI/CD pipeline for the Django backend service. The primary focus is to integrate automated static code analysis and test coverage reporting to act as quality gates, preventing the deployment of code that does not meet predefined standards.

Objective:
A modified GitHub Actions workflow that automatically runs Pytest with coverage reporting and a static analysis tool (e.g., Flake8, Pylint). The pipeline must be configured to fail the build if code coverage falls below 85% or if critical code style/quality issues are detected.

Complexity Level: Intermediate
Expected Duration: 3 weeks

---

## Learning Opportunities
- Applying CI/CD principles in a production-like AWS EKS environment.
- Integrating and configuring code quality tools within an enterprise GitHub Actions workflow.
- Understanding the practical trade-offs of enforcing strict quality gates in a collaborative development environment.

---

## Step-by-Step Plan
1.  **Preparation Stage**
    - Obtain access to the project's GitHub repository and AWS staging environment (read-only).
    - Follow project documentation to set up the Nexus backend for local development using Docker.
    - Create a new feature branch for the CI/CD enhancements (e.g., `feature/ci-quality-gates`).
2.  **Exploration Stage**
    - Thoroughly review the existing GitHub Actions workflow (`.github/workflows/deploy.yml`) to understand the current `test`, `build`, and `deploy` jobs.
    - Research best practices for integrating Pytest code coverage (`pytest-cov`) into a GitHub Actions workflow.
    - Evaluate and select a suitable static analysis tool (e.g., Flake8) for the Django project.
3.  **Implementation Stage**
    - In your feature branch, modify the `test` job in the workflow file to execute `pytest` with the `--cov` flag.
    - Configure the Pytest step to fail if the total coverage percentage is below 85%.
    - Add a new step within the `test` job to install and run the chosen static analysis tool against the Python codebase.
    - Configure the static analysis step to fail the workflow if it finds critical errors.
4.  **Testing & Feedback Stage**
    - Push commits to your feature branch to trigger the modified workflow and verify its behavior.
    - Intentionally commit code with low test coverage to confirm that the coverage gate correctly fails the build.
    - Intentionally commit code with obvious linting errors to confirm the static analysis gate works.
    - Submit a Pull Request for review by the mentor/senior engineer.
5.  **Delivery Stage**
    - Address any feedback and refine the Pull Request.
    - Add a brief summary to the PR description explaining the new pipeline stages, the thresholds set, and how to interpret the results.
    - Once approved, merge the changes into the `main` branch.

---

## Resources & References
- Project "Nexus" Documentation v1.0
- Nexus Backend `README.md` for local setup instructions.
- Official GitHub Actions Documentation: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
- Pytest-cov Plugin Documentation for coverage configuration.

---

## Next Steps
- Accept the invitation to the project's GitHub organization.
- Schedule a 30-minute kickoff meeting with your mentor to review the task and access permissions.
- Begin the "Preparation Stage" by cloning the repository and setting up the local development environment.