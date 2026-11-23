# Closet Cycle test plan

## Scope and strategy

Test the React user flows and Java API across unit, integration, system, accessibility/usability, security, performance, and post-deployment smoke layers. The API integration suite lives in `backend/src/test/java/com/closetcycle/api/ClosetCycleApiIntegrationTest.java`. The current automated run passed 18 API integration tests; its evidence is in `TEST_EXECUTION_LOG.md`. Remaining cases in the tables are plans and must not be presented as executed.

## Entry and exit criteria

Entry: Java 25 LTS, Maven 3.6.3+, Node 20+, pnpm, configured test environment, and a clean test database. Exit: all release-blocking cases pass; every failure has an issue, owner, severity, and disposition; no critical/high security issue is open; accessibility and smoke checks have evidence; the build artefacts and environment versions are recorded.

## Automated API cases

| ID | Scenario | Expected result | Current evidence |
| --- | --- | --- | --- |
| API-01 | Browse listings without a token | 200; available listings only | Passed in ENV-001 |
| API-02 | Filter by size, category, and maximum credits | 200; each returned row matches filters | Passed in ENV-001 |
| API-03 | Read own wallet with token | 200; balance matches account | Authenticated wallet checked in ENV-001 exchange flow |
| API-04 | Register valid member | 201; JWT and profile returned | Passed in ENV-001 |
| API-05 | Register duplicate email | 409; no second account | Passed in ENV-001 |
| API-06 | Login with incorrect password | 401; generic error | Passed in ENV-001 |
| API-07 | Read another member wallet | 403 | Passed in ENV-001 |
| API-08 | Create listing without authentication | 401 | Passed in ENV-001 |
| API-09 | Change another member's listing | 403 | Passed in ENV-001 |
| API-10 | Submit listing with blank title | 400 with validation detail | Passed in ENV-001 |
| API-11 | Request credit exchange, accept, arrange, confirm once | Status advances; no settlement yet | Passed in ENV-001 |
| API-12 | Second participant confirms | Completed; balances and ledger settle exactly once | Passed in ENV-001 |
| API-13 | Non-owner accepts request | 409; request remains unchanged | Passed in ENV-001 |
| API-14 | Request own listing | 409; no exchange created | Passed in ENV-001 |
| API-15 | Request exchange without enough credits | 409; no reservation or ledger change | Passed in ENV-001 |
| API-16 | Confirm as a nonparticipant | 403; no status change | Passed in ENV-001 |
| API-17 | Register with invalid email | 400; no account created | Add/confirm in next test pass |
| API-18 | Upload unsupported file type | 400; no stored file | Manual/API test required |
| API-19 | Upload file larger than 10 MB | 400; no stored file | Manual/API test required |
| API-20 | Update own available listing | 200; new data persists | Manual/API test required |
| API-21 | Archive own available listing | 200; excluded from browse | Manual/API test required |
| API-22 | Archive reserved/exchanged listing | 409; state unchanged | Manual/API test required |
| API-23 | Two owners accept requests for the same listing concurrently | One succeeds; other receives conflict | Load/concurrency test required |
| API-24 | Replay completion confirmation | No duplicate credit transaction | Manual/API test required |
| API-25 | Expired or tampered JWT | 401; protected resource denied | Security test required |
| API-26 | Health endpoint | 200 when healthy; no secret detail exposed | Smoke test required |
| API-27 | Member reports another member's listing | 201; report appears as OPEN | Passed in ENV-001 |
| API-28 | Member reports own listing | 409; no report created | Passed in ENV-001 |
| API-29 | Ordinary member opens moderator queue | 403 | Passed in ENV-001 |
| API-30 | Moderator resolves report | 200; status changes to RESOLVED | Passed in ENV-001 |

## System and nonfunctional cases

| ID | Scenario | Method and pass criterion | Evidence to save |
| --- | --- | --- | --- |
| SYS-01 | New account to listing to request to confirmed exchange | Manual two-account run; all state and credit changes agree | Screen recording and test log |
| SYS-02 | Responsive browse, item detail, and listing form | Test 360px, 768px, and 1440px; no clipped primary action | Screenshots and device/browser versions |
| SYS-03 | Keyboard-only navigation | All controls reachable, visible focus, sensible order | Checklist and short recording |
| SYS-04 | Screen-reader labels and errors | Labels, headings, status announcements are understandable | NVDA/VoiceOver notes |
| SEC-01 | Stored password inspection | BCrypt hash only; no plaintext | DB query with values redacted |
| SEC-02 | Authorization/IDOR checks | Cannot read or mutate another member's private data | Request/response evidence |
| SEC-03 | Upload MIME spoof and path traversal | Reject spoofed/unsafe input; no path escape | Security test evidence |
| PERF-01 | 100 concurrent browse requests, 5-minute run | p95 < 1.5s; error rate < 1%; record hardware and dataset | k6/JMeter output |
| PERF-02 | 25 concurrent exchange transitions | No double settlement, overspend, or lost update | Load report and ledger check |
| DEP-01 | Post-deploy health and public browse | HTTPS succeeds; health green; listing API responds | Timestamped URL and screenshots |
| DEP-02 | Backup and restore rehearsal | Restore into isolated DB and reconcile sample records | Backup/restore log |

## Defect severity and regression

Critical: data exposure, unauthorized credit transfer, or unrecoverable data loss. High: core exchange cannot complete or account compromise. Medium: major flow broken with workaround. Low: cosmetic or isolated copy issue. Every defect record must include ID, build, steps, expected/actual, severity, owner, fix commit, retest result, and regression scope. Re-run affected tests plus API-01, API-07, API-11, API-12, API-15, and SYS-01 after backend changes.

## Coverage

Repeat `mvn -f backend/pom.xml clean verify` and `pnpm install --frozen-lockfile` plus `pnpm build` before release. Capture JaCoCo line/branch coverage when a coverage plugin and threshold are agreed with the instructor; no coverage number is currently claimed. Add component tests for React routes/forms as part of the next team test pass.
