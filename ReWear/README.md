# Closet Cycle

Closet Cycle is a campus clothing exchange prototype. Members browse and list pre-owned clothes, request a direct swap or credit exchange, coordinate a handover, and confirm completion. Credits are an internal exchange balance, not money. The prototype does not process payments or arrange delivery.

## Project contents

- `src/` — responsive React/Vite interface, wired to the Java API.
- `backend/` — Java 25 LTS, Spring Boot REST API, PostgreSQL/H2 persistence, JWT authentication, exchange/credit workflow, and image storage.
- `infra/aws/` — Terraform source for the proposed AWS pilot architecture.
- `.github/workflows/ci.yml` — frontend build and backend integration test workflow.
- `docs/` — startup brief, architecture, test plan, execution log, and launch checklist.

## Run the UI and API locally

Requirements: Node.js 22, pnpm 10, Java 25 LTS, Maven 3.6.3+, and Docker Desktop (for the local PostgreSQL container).

1. From this directory, copy `.env.example` to `.env` and set a private `DATABASE_PASSWORD` for the local database.
2. Start the Java API and PostgreSQL from `backend/`:

   ```powershell
   cd backend
   docker compose up --build
   ```

   The API is at `http://localhost:8080`; health is at `/actuator/health`. Local mode uses PostgreSQL plus local uploads and seeds fictional accounts on an empty database. On a fresh database, demo logins are `maya@closetcycle.local` / `demo-password-1`, `amara@closetcycle.local` / `demo-password-2`, and `leo@closetcycle.local` / `demo-password-3`.

3. In a second terminal, from the repository root:

   ```powershell
   pnpm install --frozen-lockfile
   pnpm dev
   ```

   The UI runs at the Vite URL printed by the command. It uses `VITE_API_BASE_URL` from `.env`, defaulting to `http://localhost:8080`.

For a no-Docker API run, install Maven and run `mvn -f backend/pom.xml spring-boot:run` from the repository root. This uses local H2 and a local upload folder.

## Deploy the frontend to Vercel

The Vite frontend is configured for Vercel in `vercel.json` (builds to `dist/` and rewrites client-side routes to `index.html`). Import this repository into Vercel and set the project **Root Directory** to `ReWear` if the repository root is its parent folder. Keep the framework preset as Vite and use pnpm; Vercel reads `pnpm-lock.yaml`.

Before deploying, host the Spring Boot API separately on a Java-capable service and configure these settings:

- In Vercel, add `VITE_API_BASE_URL` with the public HTTPS base URL of the API (no trailing slash), for Production and any Preview environments you use. This value is bundled into the public frontend; never put secrets in `VITE_*` variables.
- On the API host, set `CLOSET_CYCLE_ALLOWED_ORIGINS` to the exact Vercel site origin (for example, `https://your-project.vercel.app`) so browser requests pass CORS checks. Add any custom domain or preview origin that should be allowed.
- Run the API with the `prod` profile, a managed PostgreSQL database, and persistent object storage. Do not rely on local H2 or container-local uploads for a deployed service.

Vercel deploys only the frontend here; it does not build or host the Java API. Deploying both the frontend and API requires separate hosting for the backend. After setting environment variables, redeploy so Vite can include the API URL in the frontend build.

## Automated validation

Run from the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm build
mvn -f backend/pom.xml clean verify
```

The Java integration tests use a separate in-memory H2 database. CI runs the frontend build and backend suite on GitHub Actions. See `docs/TEST_PLAN.md` for manual, security, usability, concurrency, and deployment cases. The latest Java 25 backend build and test results are recorded in `docs/TEST_EXECUTION_LOG.md`; the TypeScript check passes. Deployment and nonfunctional tests remain pending.

## API and Java concepts

The API includes registration/login, authenticated profile updates, clothing browse/filter/create/edit/archive, image uploads, exchange request/accept/decline/cancel/arrange/confirm, credit history, and a report queue with moderator-only resolution. Passwords use BCrypt; protected requests use signed JWTs. Database migrations are in `backend/src/main/resources/db/migration/`.

The source demonstrates object-oriented entities, a shared `AuditedEntity` superclass, Java interfaces for services/repositories, domain-specific exceptions, asynchronous exchange notifications on a bounded executor, transactional row locking for settlement, and local/cloud file storage. The REST endpoint summary and demo payloads are in `backend/README.md`.

## Cloud deployment

The proposed AWS architecture is in `docs/ARCHITECTURE.md`; Terraform is in `infra/aws/`. It provisions an HTTPS API load balancer, ECS Fargate, private PostgreSQL, private encrypted S3 media, a private static-site bucket behind CloudFront, CloudWatch logs/health alarm, autoscaling, and a budget notification. Before using it:

- supply a reviewed API domain, Route 53 hosted zone, ACM certificate in the chosen region, immutable API image URI, and budget email;
- configure secure remote Terraform state with encryption and access control because Terraform state contains generated DB/JWT secrets;
- review `terraform plan`, cloud-region charges, least privilege, backup retention, and account ownership;
- build the frontend with `VITE_API_BASE_URL=https://<api_hostname>`, upload `dist/` to the output `frontend_bucket`, and invalidate CloudFront;
- verify HTTPS, health, auth, media, database migration, logs, alarm delivery, backup, and restore.

No AWS deployment has been performed and no live URL is claimed. The AWS estimate in `docs/ARCHITECTURE.md` is a planning range; refresh it in AWS Pricing Calculator and set the alert before provisioning. The Terraform budget notification is an alert, not a spending cap. Destroy temporary resources after the course demo.

## Privacy and demo safety

Seed users/listings are fictional. Do not upload real personal photos or addresses into the demo. Never commit `.env`, credentials, Terraform state, or real member data. Production profile uses private S3 and IAM task credentials; local mode uses the filesystem. HTTPS, secret storage, database backup, and a staffed moderation/report process are deployment requirements.

## Submission pack

- `docs/PROJECT_DELIVERABLES.md` — Lean Canvas, SWOT/PESTEL, MVP, business model, funding/DPIIT/IP readiness, compliance, and demo plan.
- `docs/TOPIC_PROPOSAL.md` — draft proposal for mentor approval.
- `docs/ECOMMERCE_DESIGN.md` — customer journey, payment decision, handover/logistics, marketing plan, and checklist.
- `docs/UML_CLASS_DIAGRAM.md` — UML class diagram reflecting the Java source.
- `docs/USER_RESEARCH_PLAN.md` — consent-first interview guide and evidence template; no user research is claimed complete.
- `docs/SEM5_ASSIGNMENT_CROSSWALK.md` — requirement-by-requirement status against Sem 5 brief.
- `docs/STARTUP_READINESS.md` — acquisition, revenue hypotheses, risk register, and launch gates.
- `docs/ARCHITECTURE.md` — deployment architecture, reliability/security controls, and cost model.
- `docs/TEST_PLAN.md` and `docs/TEST_EXECUTION_LOG.md` — 30+ cases and transparent execution evidence.
- `docs/PITCH_DECK.md` — 12-slide deck script with speaker notes for the presentation.
- `docs/DEMO_SCRIPT.md` — timed five-minute demo and handoff checklist.

Replace institution/team details and add actual user research, test runs, cloud screenshots/URL, and the recorded demo before final submission. Do not present proposed targets or planning estimates as measured outcomes.
