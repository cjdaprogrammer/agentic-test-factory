# Agentic E-commerce Test Factory

**Playwright · TypeScript · Cucumber.js (BDD) · Page Object Model · Docker · GitHub Actions · AI-Assisted Testing**

An AI-assisted QA automation platform that transforms Jira user stories into reviewed BDD scenarios, executes automated Playwright tests, performs visual regression testing, and connects test results with Jira and Zephyr Scale.

AI assists with test planning, scenario generation, gap analysis, and failure investigation. **A human must review and approve AI-generated scenarios before they can be executed.**

## Architecture

```text
                  JIRA USER STORY
                         |
                         v
                  story:fetch
                         |
                         v
                   ai:plan
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Test Plan (.md)        BDD Draft (.feature)
                                     |
                                     v
                              Human Review
                                     |
                                     v
                                  ai:approve
                                     |
                                     v
                           Approved BDD Scenario
                               (@reviewed)
                                     |
                                     v
                         Cucumber.js + Playwright
                              Page Object Model
                                     |
                  +------------------+------------------+
                  |                  |                  |
                  v                  v                  v
             BDD Reports       Visual Testing       Test Evidence
                  |                  |                  |
                  +------------------+------------------+
                                     |
                                     v
                              AI Assistance
                        Failure Summary / Locator
                              Suggestions
                                     |
                                     v
                              Zephyr Publish
```

## Key Features

### 1. AI-Assisted Test Planning
- Converts Jira user stories into structured test plans.
- Generates draft BDD scenarios from acceptance criteria.
- Identifies potential missing test coverage.
- Supports Anthropic API integration.
- Provides fallback generation when an API key is unavailable.

### 2. Human-in-the-Loop Approval
- AI-generated scenarios are stored in `features/drafts/`.
- Drafts are excluded from Cucumber execution.
- A human reviews and approves scenarios through `ai:approve`.
- Approved scenarios receive the `@reviewed` tag.
- AI-generated locator suggestions are presented as recommendations, not automatically applied changes.

### 3. Automated BDD Testing
- Cucumber.js for behavior-driven development.
- Playwright for browser automation.
- TypeScript for test implementation.
- Page Object Model for reusable page interactions.
- Accessibility-oriented locators.
- Smoke and full BDD test execution.

### 4. Visual Regression Testing
- Playwright screenshot comparisons.
- Home page and discounted cart visual checks.
- Screenshot baseline management.
- Optional Percy integration.
- Docker-based baseline generation for consistent rendering environments.

### 5. Test Evidence and Reporting
- Cucumber HTML and JSON reports.
- Playwright HTML reports.
- Failure screenshots.
- Playwright traces and videos.
- DOM snapshots.
- AI-generated failure summaries.
- Locator-fix suggestion reports.

### 6. Jira and Zephyr Scale Integration
- Fetches Jira stories.
- Associates BDD scenarios with Jira issue keys.
- Maps test scenarios to Zephyr Scale test cases.
- Supports publishing execution results to Zephyr Scale.

### 7. Docker and CI/CD
- Dockerized test execution.
- Docker Compose services for BDD, smoke, and visual testing.
- GitHub Actions pull-request smoke testing.
- Scheduled full BDD and visual test execution.
- CI artifact collection.

---

## Tech Stack

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

## Quick Start

### Prerequisites

- Node.js
- npm
- Docker Desktop (for containerized execution)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/agentic-test-factory.git
cd agentic-test-factory
```

### 2. Install dependencies

```bash
npm install
npx playwright install chromium
```

### 3. Configure environment variables

Create your local `.env` file:

```bash
cp .env.example .env
```

API credentials are optional for basic test execution. Configure the required credentials locally if you want to use the external AI, Jira, or Zephyr integrations.

**Never commit `.env` or API tokens to GitHub.**

### 4. Run the test suites

```bash
npm run typecheck
npm run test:bdd
npm run test:smoke
```

### 5. Run visual regression tests

Generate screenshot baselines inside Docker:

```bash
docker compose run --rm visual-update
```

Execute visual comparisons:

```bash
docker compose run --rm visual
```

The bundled demo shop in `demo-shop/` starts automatically for local test execution. To test another application, configure `BASE_URL` and adapt the relevant page objects and step definitions.

---

## Verified Test Results

The following results have been successfully verified using Docker:

| Test Suite | Scenarios / Tests | Result |
|---|---:|---|
| BDD | 9 scenarios, 54 steps | Passed |
| Smoke | 3 scenarios, 18 steps | Passed |
| Visual Regression | 2 tests | Passed |

**Note:** The smoke suite is a subset of the full BDD suite. These results should not be interpreted as 14 unique scenarios.

### Docker execution

```bash
docker compose run --rm bdd
docker compose run --rm smoke
docker compose run --rm visual
```

---

## Portfolio Walkthrough: Jira Story to Automated Tests

The project demonstrates an end-to-end workflow using the example story:

**PROJ-101 – A shopper can apply a discount code.**

### Step 1: Jira Story

The example story is stored in:

```text
stories/PROJ-101.md
```

A real Jira issue can be retrieved using:

```bash
npm run story:fetch -- PROJ-101
```

### Step 2: Generate the Test Plan and BDD Draft

```bash
npm run ai:plan -- stories/PROJ-101.md
```

Generated files:

```text
plans/PROJ-101.plan.md
features/drafts/PROJ-101.feature
```

### Step 3: Identify Test Coverage Gaps

```bash
npm run ai:gaps
```

The gap analysis compares the story requirements with existing feature scenarios. The example intentionally leaves out the requirement concerning only one discount code being applied at a time.

### Step 4: Review and Approve

Review the generated feature file, make any necessary corrections, and approve it:

```bash
npm run ai:approve -- features/drafts/PROJ-101.feature
```

The approval process requires explicit human confirmation before moving the scenario into the executable feature directory.

### Step 5: Execute Automated Tests

```bash
npm run test:bdd
```

The execution generates reports and supporting evidence, including screenshots, traces, videos, and DOM snapshots when applicable.

### Step 6: Analyze Failures

Generate an AI-assisted failure summary:

```bash
npm run ai:summarize
```

Generate locator-fix suggestions:

```bash
npm run ai:locator-fix
```

Both scripts produce recommendations for human review.

### Step 7: Publish Test Results

```bash
npm run zephyr:publish
```

The integration supports mapping scenario tags to Zephyr Scale test cases. Without the required token, it runs in dry-run mode.

---

## AI Assistant and Guardrails

The AI implementation is located in:

```text
ai/
```

The project uses `ai/llm.ts` to call the Anthropic Messages API when `ANTHROPIC_API_KEY` is configured.

Without an API key, the scripts provide fallback behavior:

- Test plans and drafts are generated from acceptance criteria.
- Gap analysis uses a keyword-based heuristic.
- Failure summaries provide raw failure information.

### Responsible AI Practices

- Story content, DOM data, and error output are treated as untrusted input.
- Prompts instruct the AI not to follow instructions embedded in untrusted data.
- AI-generated scenarios remain outside the executable feature directory until approved.
- Locator suggestions are documented rather than automatically applied.
- Approved scenarios include the `@reviewed` tag and a review comment.

---

## Traceability Tags

| Tag | Purpose |
|---|---|
| `@PROJ-101` | Jira issue key assigned to a feature |
| `@PROJ-T101` | Zephyr Scale test case key assigned to a scenario |
| `@smoke` | Identifies scenarios included in smoke testing |
| `@ai-draft` | Identifies AI-generated scenarios awaiting review |
| `@reviewed` | Identifies scenarios approved by a human |

Replace the `PROJ` prefix with your actual Jira project key.

The Zephyr integration is implemented in:

```text
integrations/zephyr.ts
```

It targets the Zephyr Scale Cloud API. Adjust endpoint details and field mappings if your Jira and Zephyr configuration differs.

---

## Visual Testing

The project includes two visual testing approaches.

### Playwright Screenshot Assertions

File:

```text
tests/visual.spec.ts
```

Includes screenshot comparisons for:

- E-commerce homepage.
- Shopping cart after applying a discount code.

Generate baselines using Docker:

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

Run Percy snapshots with:

```bash
PERCY_TOKEN=your_token npm run test:percy
```

Percy requires a configured account and token.

---

## Docker and GitHub Actions

### Docker Compose Services

| Service | Purpose |
|---|---|
| `bdd` | Runs the complete BDD suite |
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

Runs type checking and smoke tests on pull requests.

**Nightly Workflow**

```text
.github/workflows/nightly.yml
```

Configured to run the broader BDD and visual test suites, AI-assisted reporting, Zephyr publishing, and artifact collection on a schedule.

Configure the required GitHub repository secrets and variables before enabling external integrations.

Suggested secrets:

- `ANTHROPIC_API_KEY`
- `ZEPHYR_API_TOKEN`

Suggested variables:

- `ZEPHYR_PROJECT_KEY`
- `ZEPHYR_TEST_CYCLE_KEY`

Use GitHub Actions secrets for sensitive credentials. Never hardcode tokens in workflow files.

**Version consistency:** Keep the Playwright version synchronized across `package.json`, `Dockerfile`, and the CI workflow.

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
│   └── suggest-locator-fix.ts
│
├── demo-shop/
│   └── public/
│
├── stories/
│   └── PROJ-101.md
│
├── plans/
│
├── features/
│   ├── drafts/
│   └── step-definitions/
│
├── pages/
│
├── integrations/
│   ├── jira.ts
│   └── zephyr.ts
│
├── tests/
│   ├── visual.spec.ts
│   └── percy.spec.ts
│
├── reports/
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

## Why Cucumber.js Instead of TestNG?

This project uses TypeScript and Playwright, making Cucumber.js a natural choice for its BDD implementation.

Cucumber.js integrates with the TypeScript-based automation framework and supports readable Gherkin scenarios.

TestNG is primarily used in Java-based automation projects, such as Java and Appium testing frameworks.

Both frameworks support structured automated testing, but they belong to different technology stacks.

---

## Project Objective

This project demonstrates how AI-assisted workflows can support practical QA engineering activities without removing human responsibility from test design and approval.

It brings together:

- Requirements analysis.
- Test planning.
- BDD scenario development.
- Browser automation.
- Visual regression testing.
- Test evidence and reporting.
- Test management integration.
- Containerized execution.
- CI/CD automation.
- Human-reviewed AI assistance.

**The goal is to demonstrate a traceable, maintainable, and reviewable QA automation workflow from a Jira requirement to automated test execution and reporting.**