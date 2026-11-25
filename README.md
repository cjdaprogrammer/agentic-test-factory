# Agentic E-commerce Test Factory

**Playwright · TypeScript · Cucumber.js · Page Object Model · Docker · GitHub Actions · AI-Assisted QA**

An AI-assisted QA automation platform that connects requirements analysis, BDD test development, browser automation, visual regression testing, and test management reporting.

The platform uses AI to assist with test planning, scenario generation, coverage analysis, and failure investigation. Human review and approval are required before AI-generated scenarios can become executable tests.

**Repository:** [github.com/cjdaprogrammer/agentic-test-factory](https://github.com/cjdaprogrammer/agentic-test-factory)

---

## Key Features

### 1. AI-Assisted Test Planning

- Converts Jira user stories into structured test plans.
- Generates draft BDD scenarios from acceptance criteria.
- Suggests potential test coverage gaps.
- Supports Anthropic API integration.
- Provides offline fallback behavior for supported workflows.

### 2. Human-in-the-Loop Approval

- Stores AI-generated scenarios in `features/drafts/`.
- Keeps unapproved drafts outside the executable feature directory.
- Validates drafts before approval.
- Requires explicit human confirmation.
- Adds a `@reviewed` tag and review information to approved scenarios.
- Presents locator suggestions as recommendations rather than automatically modifying application code.

### 3. BDD Test Automation

- Cucumber.js for behavior-driven development.
- Playwright for browser automation.
- TypeScript for test implementation.
- Page Object Model for reusable interactions.
- Gherkin scenarios for readable, requirements-based testing.
- Smoke and full BDD test execution.

### 4. Visual Regression Testing

- Playwright screenshot comparisons.
- Homepage and discounted-cart visual checks.
- Screenshot baseline management.
- Docker-based baseline generation for consistent rendering.
- Optional Percy integration.

### 5. Requirements Traceability

- Maps acceptance criteria to BDD scenarios.
- Associates scenarios with Zephyr Scale test cases.
- Extracts execution status from Cucumber reports.
- Counts recognized passing and failing assertions.
- Generates a Markdown traceability report.
- Identifies missing or incomplete coverage.

Run:

```bash
npm run traceability
```

Generated report:

```text
reports/PROJ-101-traceability.md
```

### 6. Test Evidence and Reporting

- Cucumber JSON and HTML reports.
- Playwright HTML reports.
- Failure screenshots.
- Playwright traces and videos when configured.
- DOM snapshots.
- AI-assisted failure summaries.
- Locator-fix suggestion reports.

### 7. Jira and Zephyr Scale Integration

- Retrieves Jira user stories.
- Associates automated scenarios with test management identifiers.
- Maps BDD scenario tags to Zephyr Scale test cases.
- Publishes test execution results to Zephyr Scale.

### 8. Docker and CI/CD

- Dockerized test execution.
- Docker Compose services for BDD, smoke, and visual testing.
- GitHub Actions pull-request smoke testing.
- Scheduled BDD and visual test execution.
- CI artifact collection and test reporting.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Language | TypeScript |
| Browser Automation | Playwright |
| BDD Framework | Cucumber.js |
| Design Pattern | Page Object Model |
| AI Integration | Anthropic API |
| Test Management | Jira, Zephyr Scale |
| Visual Testing | Playwright Screenshot Assertions, Percy (optional) |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Package Management | npm |
| Reporting | Cucumber Reports, Playwright Reports |

---

## Quick Start

### Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop (for containerized execution)

### 1. Clone the repository

```bash
git clone https://github.com/cjdaprogrammer/agentic-test-factory.git
cd agentic-test-factory
```

### 2. Install dependencies

```bash
npm ci
npx playwright install chromium
```

### 3. Configure environment variables

For Windows CMD:

```cmd
copy .env.example .env
```

For PowerShell or macOS/Linux:

```bash
cp .env.example .env
```

Configure optional API credentials for AI, Jira, and Zephyr integrations as required.

Never commit `.env` files or API tokens.

### 4. Run TypeScript validation and BDD tests

```bash
npm run typecheck
npm run test:bdd
npm run test:smoke
```

### 5. Run visual regression tests

Generate screenshot baselines in Docker:

```bash
docker compose run --rm visual-update
```

Execute visual comparisons:

```bash
docker compose run --rm visual
```

The bundled demo shop in `demo-shop/` is used for the default test environment. To test another application, configure `BASE_URL` and adapt the relevant page objects and step definitions.

---

## Verified Test Results

The following results have been successfully verified:

| Test Suite | Result |
|---|---|
| TypeScript validation | Passed |
| Full BDD suite | 10 scenarios, 71 steps passed |
| Smoke suite | 3 scenarios, 18 steps passed |
| Visual regression | 2 tests passed |
| Requirements traceability | 8/8 criteria verified |
| Recognized assertions | 40/40 passed |

The smoke suite is a subset of the full BDD suite and should not be counted as additional unique scenarios.

**Important:** The traceability result represents the criteria and assertion patterns recognized by the local generator. It does not independently prove complete business-rule coverage.

### Docker execution

```bash
docker compose run --rm bdd
docker compose run --rm smoke
docker compose run --rm visual
```

Docker is the preferred environment for visual regression comparisons because screenshot rendering can differ between operating systems.

---

## Portfolio Walkthrough: Jira Story to Automated Tests

The demonstration workflow uses:

**PROJ-101 — A shopper can apply a discount code.**

The example story is stored in:

```text
stories/PROJ-101.md
```

### Step 1: Retrieve a Jira Story

```bash
npm run story:fetch -- PROJ-101
```

The integration retrieves the specified Jira issue when valid credentials and configuration are available.

### Step 2: Generate a Test Plan and BDD Draft

```bash
npm run ai:plan -- stories/PROJ-101.md
```

Generated files:

```text
plans/PROJ-101.plan.md
features/drafts/PROJ-101.feature
```

### Step 3: Analyze Potential Coverage Gaps

```bash
npm run ai:gaps
```

The gap analysis compares acceptance criteria with existing feature scenarios.

The offline fallback uses keyword-based heuristics. Keyword overlap is an indicator for manual review, not proof that a requirement is behaviorally covered.

### Step 4: Review and Approve the Draft

Review the generated feature file, implement the required steps, and resolve all placeholders before approval.

```bash
npm run ai:approve -- features/drafts/PROJ-101.feature
```

The approval process validates the draft and requires explicit human confirmation before moving it into the executable feature directory.

Approval validation does not replace reviewing the scenario's business logic or verifying that its step definitions are implemented correctly.

### Step 5: Execute the BDD Tests

```bash
npm run test:bdd
```

Cucumber and Playwright execute the feature scenarios and generate test reports and supporting evidence.

### Step 6: Generate Requirements Traceability

```bash
npm run traceability
```

The generator maps acceptance criteria to scenario tags, recognized assertions, execution results, and Zephyr test-case identifiers.

### Step 7: Investigate Failures

```bash
npm run ai:summarize
npm run ai:locator-fix
```

These scripts generate failure summaries and locator recommendations when relevant failure data is available.

The generated recommendations require human review. They do not automatically modify page objects or repair tests.

### Step 8: Publish Test Results

```bash
npm run zephyr:publish
```

The integration maps scenario tags to Zephyr Scale test cases and publishes execution results when the required configuration and credentials are available.

---

## Requirements and Zephyr Traceability

The demonstration feature uses acceptance-criteria tags and Zephyr test-case tags to connect requirements with executable tests.

### Acceptance Criteria Mapping

| Acceptance Criterion | Zephyr Test Case |
|---|---|
| AC-TC01 — Percentage discount | ATF-T1 |
| AC-TC02 — Fixed discount and minimum spend | ATF-T2, ATF-T3 |
| AC-TC03 — Invalid code | ATF-T4 |
| AC-TC04 — Expired code | ATF-T4 |
| AC-TC05 — Case-insensitive codes | ATF-T5 |
| AC-TC06 — One code per order | ATF-T8 |
| AC-TC07 — Remove applied discount | ATF-T6 |
| AC-TC08 — Empty cart restriction | ATF-T7 |

### Tag Conventions

| Tag | Purpose |
|---|---|
| `@ATF-1` | Feature-level identifier |
| `@ATF-T1` through `@ATF-T8` | Zephyr Scale test-case associations |
| `@AC-TC01` through `@AC-TC08` | Acceptance-criteria associations |
| `@smoke` | Identifies smoke-test scenarios |
| `@ai-draft` | Identifies unapproved AI-generated scenarios |
| `@reviewed` | Identifies human-approved scenarios |

### Traceability Report

The generator produces:

```text
reports/PROJ-101-traceability.md
```

The report includes:

- Acceptance-criteria coverage.
- Associated Zephyr test cases.
- Scenario execution status.
- Recognized assertion evidence.
- Passing and failing assertion counts.
- Coverage limitations.

**Important:** Traceability is derived from scenario tags and recognized assertion patterns in the local Cucumber report. It does not independently query Zephyr or prove complete business-rule coverage.

---

## AI Implementation and Responsible AI

AI-related functionality is located in:

```text
ai/
```

The project uses `ai/llm.ts` to integrate with the Anthropic Messages API when `ANTHROPIC_API_KEY` is configured.

### Implemented AI-Assisted Workflows

- Test-plan and BDD draft generation.
- Potential coverage-gap suggestions.
- Failure summarization.
- Locator-fix recommendations.
- Human-controlled draft approval.

### Offline Fallback Behavior

When an API key is unavailable, supported scripts provide fallback behavior.

- Test planning and draft generation use acceptance-criteria-based generation.
- Gap analysis uses keyword-based heuristics.
- Failure summarization can report raw failure information.
- Locator suggestions can report when no locator-style failures are found.

The offline fallback does not provide the same capabilities as a live AI model.

### Human Oversight and Guardrails

- Story content, DOM information, and error output are treated as untrusted input.
- AI-generated scenarios remain outside executable features until approved.
- Draft validation rejects unreviewed `@ai-draft` tags and unresolved TODO/TBD placeholders.
- Human review is required before approval.
- Locator suggestions are recommendations, not automatic code changes.

---

## Visual Testing

The project includes Playwright screenshot comparisons and optional Percy integration.

### Playwright Screenshot Assertions

File:

```text
tests/visual.spec.ts
```

The suite includes visual checks for:

- E-commerce homepage.
- Shopping cart after applying a discount.

Generate screenshot baselines:

```bash
docker compose run --rm visual-update
```

Run comparisons:

```bash
docker compose run --rm visual
```

### Optional Percy Integration

File:

```text
tests/percy.spec.ts
```

Run Percy snapshots:

```bash
npm run test:percy
```

Percy requires a configured account and `PERCY_TOKEN`.

The standard Playwright visual suite excludes Percy-tagged tests. Percy snapshots are executed separately using `npm run test:percy`.

---

## Docker and GitHub Actions

### Docker Compose Services

| Service | Purpose |
|---|---|
| `bdd` | Runs the full BDD suite |
| `smoke` | Runs smoke-tagged scenarios |
| `visual` | Executes visual regression tests |
| `visual-update` | Updates screenshot baselines |

Examples:

```bash
docker compose run --rm bdd
docker compose run --rm smoke
docker compose run --rm visual
docker compose run --rm visual-update
```

### GitHub Actions Workflows

**Pull Request Workflow**

```text
.github/workflows/pr-smoke.yml
```

On pull requests, this workflow:

- Installs Node.js dependencies.
- Installs Playwright Chromium.
- Runs TypeScript validation.
- Executes smoke-tagged BDD scenarios.
- Uploads reports as a GitHub Actions artifact.

**Nightly Workflow**

```text
.github/workflows/nightly.yml
```

Runs daily at **02:00 Philippine time (UTC+8)**, with manual execution also available.

The workflow:

- Executes the complete BDD suite.
- Runs visual regression tests.
- Generates AI-assisted failure summaries and locator suggestions.
- Publishes test results to Zephyr Scale.
- Uploads reports as a GitHub Actions artifact.

The visual, AI reporting, Zephyr publishing, and artifact upload steps are configured to run even when an earlier test step fails.

### GitHub Actions Configuration

Configure the following repository secrets and variables before using external integrations.

**Secrets**

| Secret | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Optional AI integration |
| `ZEPHYR_API_TOKEN` | Zephyr Scale authentication token |

**Variables**

| Variable | Example |
|---|---|
| `ZEPHYR_PROJECT_KEY` | `ATF` |
| `ZEPHYR_TEST_CYCLE_KEY` | `ATF-R1` |

Use GitHub Actions secrets for sensitive credentials. Never hardcode API tokens in workflow files or commit them to GitHub.

---

## Project Structure

```text
agentic-test-factory/
│
├── .github/
│   └── workflows/
│       ├── pr-smoke.yml
│       └── nightly.yml
│
├── ai/
│   ├── llm.ts
│   ├── generate-test-plan.ts
│   ├── suggest-gaps.ts
│   ├── approve-draft.ts
│   ├── summarize-failures.ts
│   ├── suggest-locator-fix.ts
│   └── generate-traceability.ts
│
├── demo-shop/
│
├── features/
│   ├── drafts/
│   ├── step_definitions/
│   └── support/
│
├── integrations/
│   ├── jira.ts
│   └── zephyr.ts
│
├── pages/
│
├── plans/
│
├── reports/
│
├── stories/
│   └── PROJ-101.md
│
├── tests/
│   ├── visual.spec.ts
│   └── percy.spec.ts
│
├── utils/
│
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── playwright.config.ts
├── cucumber.js
├── config.ts
├── tsconfig.json
└── README.md
```

---

## Project Objective

This project demonstrates how AI-assisted workflows can support practical QA engineering activities without removing human responsibility from test design and approval.

It brings together:

- Requirements analysis.
- Test planning.
- BDD scenario development.
- Browser automation.
- Visual regression testing.
- Requirements traceability.
- Test evidence and reporting.
- Jira and Zephyr Scale integration.
- Containerized execution.
- CI/CD automation.
- Human-reviewed AI assistance.

**The goal is to demonstrate a traceable, maintainable, and reviewable QA automation workflow from a Jira requirement to automated test execution and reporting.**