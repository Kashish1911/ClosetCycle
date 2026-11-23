# Sem 5 assignment crosswalk

**Purpose:** Track each brief requirement against the current Closet Cycle repository. “In repository” means a source/document exists; it does not imply mentor approval, a live deployment, or external validation.

## Startup and e-commerce

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Specific problem and target users | Drafted; validation pending | `TOPIC_PROPOSAL.md`; collect actual consented interviews using `USER_RESEARCH_PLAN.md`. |
| Topic proposal | Drafted, not approved | `TOPIC_PROPOSAL.md`; add course, institution, names/IDs, date, and mentor decision. |
| Lean Canvas and Business Model Canvas | Drafted | `PROJECT_DELIVERABLES.md`; all assumptions still need evidence. |
| SWOT and PESTEL | Drafted | `PROJECT_DELIVERABLES.md`. |
| MVP plan | Drafted and implemented as local prototype | `PROJECT_DELIVERABLES.md`, `TOPIC_PROPOSAL.md`, application source. |
| Funding plan | Hypothesis only | `PROJECT_DELIVERABLES.md`; add mentor-approved amount/use of funds if required. |
| DPIIT readiness, IP and compliance note | Readiness guidance drafted | `PROJECT_DELIVERABLES.md`; no recognition, incorporation, trademark, or legal review is claimed. |
| E-commerce business model and revenue streams | Hypotheses documented | `ECOMMERCE_DESIGN.md`; no revenue or partner is claimed. |
| Platform/store flow | Implemented locally | `README.md`, `ECOMMERCE_DESIGN.md`; application is not publicly deployed. |
| Payment approach | Explicitly out of MVP | Internal non-purchasable credits only; no cash gateway or checkout. Obtain review before changing this. |
| Logistics/delivery plan | Member-coordinated handover documented | `ECOMMERCE_DESIGN.md`; no courier or delivery service is integrated. |
| Digital marketing plan | Drafted, not executed | `ECOMMERCE_DESIGN.md`; obtain campus-channel permission and measure a real campaign. |
| Privacy, consent, fake-review, dark-pattern, legal/security checklist | Documented | `ECOMMERCE_DESIGN.md`, `PROJECT_DELIVERABLES.md`; policies and local legal review remain launch work. |

## Java and product

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Working core application and web/API access | Implemented and locally smoke-checked | React UI and Java 25/Spring Boot API; no public URL. |
| OOP, inheritance, interfaces, custom exceptions, multithreading, file management | Present in source | `backend/README.md` and `UML_CLASS_DIAGRAM.md`; filesystem and S3 image storage implementations exist. |
| Java source and README | Present | `backend/`, root `README.md`, and `backend/README.md`. |
| UML diagram | Added | `UML_CLASS_DIAGRAM.md`, based on current source classes. |

## Software testing

Testing is excluded from the non-testing completion claim in the user's request. The assignment still requires a complete testing package; see `TEST_PLAN.md` and `TEST_EXECUTION_LOG.md` for passed local runs and outstanding manual, security, performance, accessibility, regression, and deployment evidence.

## Cloud computing

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Cloud architecture and service choices | Designed in source | `ARCHITECTURE.md`; review and explain chosen provider/services in the presentation. |
| Public cloud deployment and URL/API | **Not done** | Needs team AWS account access, region/domain/certificate, approved spend, deployment tools, and an applied reviewed plan. |
| Containerization | Dockerfile and Compose configuration present | Docker is not installed in the current environment; build/run evidence is outstanding. |
| Cloud object storage and managed database | Terraform configuration present | Private S3 and RDS are proposed but not provisioned. |
| Cloud security | Controls configured in Terraform/source | Not independently reviewed in a live account; confirm TLS, IAM, secrets, encryption, and network rules after deployment. |
| Scalability and reliability | Plan/configuration present | ECS scaling and ALB health monitoring are defined; restore drill and live scaling evidence are pending. |
| Monitoring and logging | CloudWatch resources configured in Terraform | No deployed dashboard/log/alarm screenshots or measured metrics yet. |
| Automation | CI workflow and manual deployment procedure present | CI runs frontend build and backend tests; deploy uses documented manual steps, not a deploy-on-merge pipeline. |
| Monthly cost at 100, 1,000, and 10,000 users | Planning ranges documented | `ARCHITECTURE.md`; replace with an account/region-specific calculator export before provisioning. |

## Final submission and team evidence

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Pitch deck (10–12 slides) | Present | 12-slide deck in `deliverables/Closet_Cycle_Pitch.pptx`. Add real team and course details. |
| Final project report | Present | `deliverables/Closet_Cycle_Final_Report.docx`; update with deployment, research, and final test evidence when available. |
| Five-minute demo script | Present | `DEMO_SCRIPT.md`. |
| Five-minute demo video | **Not done** | Record the actual prototype with a team presenter after agreeing names, voice, and live/local demo setting. |
| Team roles and technical contributions | **Not recorded** | Assign members and document each member's contribution. |
| Shared version control and regular team commits | Not evidenced in this package | Team must use its shared repository and preserve member contributions. |
| Mentor reviews and approval | Not evidenced | Add actual review outcomes and dates; do not invent them. |

## External completion dependencies

The repository now contains the missing design documents and a deployment handoff. Closing the remaining non-testing gaps requires: (1) approved AWS account and monthly spend cap, (2) team-controlled AWS authentication, (3) API domain, hosted-zone ID, certificate ARN, and budget-alert email, (4) installed AWS CLI and Docker, (5) real team/institution/course details and member roles, (6) consented user research, and (7) an actual presenter to record the demonstration. Never send AWS access keys in chat; configure short-lived AWS SSO/role credentials locally.
