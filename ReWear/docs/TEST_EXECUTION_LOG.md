# Test execution log

## Current environment record

Status: Java 25 backend verification and TypeScript check passed. Cloud, Docker, performance, security penetration, accessibility, and field usability checks have not been performed.

- Date context: 23 November 2026
- Java 25 runtime used for latest backend verification: Temurin 25.0.5.1 at `~/.jdk/temurin-25`; the system `java` on PATH remains Java 21
- Maven: portable Maven 3.9.11 downloaded to the ignored `.tools/` folder
- Node: available
- pnpm: available
- Dependency install: succeeded after allowing package access; dependencies are kept in ignored local folders
- Docker: not installed in the available shell
- Cloud deployment: not performed; no account credentials or approved budget supplied

## Results table

| Run ID | Commit/build | Command | Passed | Failed | Skipped | Defects | Evidence link/path |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| ENV-001 | Local working tree, 23 Nov 2026 | `mvn -B -f backend/pom.xml clean verify` with Maven 3.9.11 / Java 21 | 18 | 0 | 0 | None from the automated suite | `backend/target/surefire-reports/` |
| ENV-002 | Local working tree, 23 Nov 2026 | `pnpm --config.store-dir=.pnpm-store --config.enableGlobalVirtualStore=false exec tsc --noEmit` | 0 reported type errors | 0 | — | Resolved missing `ApiItem` import before the successful rerun | Command output in team run log |
| ENV-003 | Local working tree, 23 Nov 2026 | `pnpm --config.store-dir=.pnpm-store --config.enableGlobalVirtualStore=false build` | 1 production bundle | 0 | 0 | None | `dist/` (generated; ignored) |
| ENV-004 | Local working tree, 23 Nov 2026 | `terraform -chdir=infra/aws validate` | Valid configuration | 0 | — | Added required lifecycle filter before final validation | `infra/aws/` configuration |
| ENV-005 | Local API, 23 Nov 2026 | `GET /actuator/health`, public browse, demo sign-in, own listings, wallet | 5 smoke checks passed | 0 | — | None observed | Local run; no public deployment |
| ENV-006 | Not deployed | Deployment smoke suite | — | — | all | Not run: no cloud deployment | Add after team deployment |
| ENV-007 | Local working tree, 23 Nov 2026 | `mvn -B -f backend/pom.xml verify` with Maven 3.9.11 / Temurin 25.0.5.1 | 20 | 1 | 0 | `insufficientCreditRequestIsRejected` expected HTTP 201 when creating a listing but received 409; reproduced when run alone | `backend/target/surefire-reports/` |
| ENV-008 | Local working tree, 23 Nov 2026 | `mvn -B -f backend/pom.xml -DskipTests package` with Maven 3.9.11 / Temurin 25.0.5.1 | Build succeeded | 0 | Tests skipped | Java 25 compilation and Spring Boot packaging succeeded | `backend/target/closet-cycle-api-0.1.0.jar` |
| ENV-009 | Local working tree, 23 Nov 2026 | `mvn -B -f backend/pom.xml verify` with Maven 3.9.11 / Temurin 25.0.5.1 | 21 | 0 | 0 | Corrected the test fixture to create the listing under Leo, who has available listing capacity | `backend/target/surefire-reports/` |
| ENV-010 | Local working tree, 23 Nov 2026 | `tsc --noEmit` with workspace TypeScript 5.9.3 | 0 reported type errors | 0 | — | Removed deprecated `baseUrl`; path aliases continue to resolve | Command output in team run log |

## Defect register

The first test/build pass found two Java compilation errors in JWT algorithm and authority typing plus one TypeScript missing import; all three were fixed before the successful Java 21 rerun. ENV-007 exposed a test fixture that attempted to exceed Amara's active-listing limit; ENV-009 records the passing rerun after assigning that test listing to Leo. This does not imply zero defects in untested flows.

| Defect ID | Severity | Build | Steps / expected / actual | Owner | Fix commit | Retest |
| --- | --- | --- | --- | --- | --- | --- |
| BUILD-001 | High | Initial local build | JWT configuration referenced an unimported algorithm type; Java authorities inferred an incompatible generic type. | Backend | Working tree fix | Passed in ENV-001 |
| BUILD-002 | Medium | Initial frontend typecheck | Profile code used `ApiItem` without importing it. | Frontend | Working tree fix | Passed in ENV-002 |
