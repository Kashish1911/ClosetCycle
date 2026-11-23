# Closet Cycle investor and semester pitch deck

12 slides; keep each slide focused. The speaker notes below are a script prompt, not evidence of completed user research. Replace team, course, institution, deployment, and actual pilot metrics before presenting.

## 1. Closet Cycle

Campus clothing exchange platform. Give good clothes another turn. Team and course placeholders.

**Speaker notes:** We are building a campus-first way for students to exchange clothes they already own.

## 2. The problem

Students have wearable pieces they no longer use. Selling requires listing, negotiation, and payment handling; direct swaps can be hard to balance. These are interview hypotheses to validate, not measured market facts.

**Speaker notes:** Explain the problem in the team’s own words and add quotes only after consented interviews.

## 3. The first customer

Students at one campus who want affordable variety and a simple way to pass on wearable clothes. Launch in one campus cluster to build listing density before expanding.

**Speaker notes:** The campus is a focused pilot boundary, not a claim of existing traction.

## 4. The Closet Cycle experience

List with photos and condition. Browse by size/category. Request a direct swap or credit-balanced exchange. Arrange the handover. Both members confirm completion.

**Speaker notes:** Walk the audience through one listing and one completed exchange.

## 5. Product and MVP

Responsive React UI. Java 25 LTS/Spring API. PostgreSQL/H2 persistence. JWT sign-in. Listings and filters. Exchange state machine. Credit ledger. Local and S3 image storage paths.

**Speaker notes:** The working local prototype includes the main transaction path; production deployment and test evidence still require team execution.

## 6. Trust and safety

Public meetup guidance. No full home addresses in listings. Two-party completion before credit settlement. Password hashing and ownership checks. Reports/moderation and real identity verification remain pilot operations to implement.

**Speaker notes:** Be explicit that no automated verification or physical delivery is provided.

## 7. Business model

Keep core exchanges free. Test an optional Pro membership with more active listings, saved searches and match alerts, optional listing spotlight controls, and a personal exchange summary. Prototype price hypothesis: ₹49 monthly or ₹399 annual. A separate idea is sponsorship for campus swap events. Neither has been validated or earns money today. The prototype shows UPI, card, and net-banking choices only in a simulated checkout; no real payment is processed.

**Speaker notes:** Emphasize that the prices are assumptions. Ask the panel which features students would actually pay for and how to protect fairness for free members.

## 8. Go-to-market

Sustainability clubs, student societies, orientation events, ambassadors, and swap events. Proposed first pilot: 30–50 opt-in members, 50 quality listings, 20 observed exchange requests.

**Speaker notes:** These are proposed targets. Replace them with achieved numbers after the pilot.

## 9. Alternatives and position

Peer marketplaces and resale apps already exist. Closet Cycle’s testable distinction is a campus-local exchange flow with direct and credit-based swaps. Validate why members would use it instead of existing alternatives.

**Speaker notes:** Bring a cited competitor comparison based on the team’s own review.

## 10. Architecture and delivery

CloudFront static UI. HTTPS load balancer. ECS Fargate Java API. Private PostgreSQL. Private encrypted S3 images. CloudWatch logs and alarms. GitHub Actions build/test.

**Speaker notes:** Show the architecture diagram; disclose whether it is deployed or still infrastructure-as-code.

## 11. Evidence, risks, and next milestones

Evidence to present: actual unit/integration results, usability session notes, completed exchange count, repeat use, and cloud cost. Key risks: liquidity, safe handover, accurate item details, privacy, and hosting cost.

**Speaker notes:** The local Java integration suite, frontend checks, Terraform validation, and local API smoke checks passed. There is no public deployment or measured pilot yet.

## 12. The ask

Request mentor feedback, approval to recruit a campus pilot, and a capped student cloud budget with spend alerts. Add a precise amount only after a pricing calculator run and team approval.

**Speaker notes:** Name the next experiment, who owns it, its date, and what decision the evidence will support.
