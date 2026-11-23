# Closet Cycle topic proposal

**Status:** Draft for team and mentor review; not an approved proposal. Replace the bracketed fields before submission.

| Field | Proposal |
| --- | --- |
| Course / institution | [Course and institution] |
| Team | [Names and student IDs] |
| Working title | Closet Cycle: a campus clothing exchange platform |
| Target users | Students and campus community members who want affordable clothing variety and have wearable items they no longer use. This segment is a hypothesis pending interviews. |
| Problem | Finding a suitable pre-owned item and arranging a trusted local exchange can take time. Direct swaps can be difficult when two people do not want each other's items. Validate the problem with consented interviews before claiming demand. |
| Proposed solution | A responsive web marketplace where members publish clothing listings, search by relevant attributes, request a direct swap or internal-credit exchange, arrange their own handover, and confirm completion together. |
| Business model | Start with a no-fee campus pilot. Test campus sponsorship or a clearly disclosed promotion/service-fee model only after measuring usage and willingness to pay. |
| MVP scope | Accounts, listings, browse/filter, image upload, exchange requests, owner decisions, two-party completion, internal credit ledger, reports, moderator review, and an illustrative Pro pricing/mock-checkout preview. No live money processing, shipping, or identity-verification claims. |
| Technology | React, TypeScript, Vite, Java 25 LTS, Spring Boot, relational database, Docker, and proposed AWS hosting with managed database and object storage. |
| Cloud rationale | A public cloud can expose the application to campus users, scale the stateless API, and provide managed database, image storage, HTTPS, logs, and health monitoring. Deployment is still pending. |
| Success measures | Interview evidence; verified pilot sign-ups; quality listings per active member; request acceptance/completion rate; time to match; repeat use; report rate; and cost per completed exchange. Targets must be agreed with the mentor and labeled as targets. |
| Key risks | Insufficient listing density, unsafe handover, inaccurate condition/size details, privacy incidents, moderation capacity, and cloud cost. |
| Requested review | Approve the topic and MVP scope; agree the interview method, pilot boundary, test acceptance criteria, and cloud budget. |

## Proposed phase outputs

1. Approve this proposal and assign team roles.
2. Conduct and summarize consented user interviews; update the problem statement with evidence.
3. Review the MVP and e-commerce design, including the simulated-only Pro checkout and the decision to keep real payments and third-party delivery out of the prototype.
4. Complete system and cloud reviews, then deploy only after the account owner approves the Terraform plan and budget.

## Approval record

| Reviewer | Decision | Date | Notes |
| --- | --- | --- | --- |
| Faculty mentor | Pending | — | — |
| Team | Pending | — | — |
