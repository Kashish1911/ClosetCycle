# Closet Cycle project delivery pack

## Project summary

Closet Cycle is a campus clothing exchange marketplace. Members list pre-owned clothing, request either a direct swap or a credit-balanced exchange, coordinate a handover, and confirm completion. Credits are an internal accounting unit: they cannot be purchased, withdrawn, or used outside Closet Cycle. The prototype has an illustrative Pro pricing and demo-checkout screen, but it does not process real payments or arrange shipping.

The intended first market is one campus community. This narrows the initial trust and logistics problem: members can use public campus locations for handovers and report issues to a moderator. The MVP is the responsive React application plus the Java API, relational data, member accounts, listings, exchange workflow, and credit ledger.

## Lean Canvas

| Area | Closet Cycle hypothesis |
| --- | --- |
| Problem | Good clothing sits unused; resale takes time; direct swaps are hard to value fairly. |
| Customer segments | Students and campus community members who want affordable wardrobe variety and lower-waste habits. |
| Unique value | A local clothing exchange with visible condition details, direct swaps, and non-cash credits. |
| Solution | Member listings, filters, swap requests, credit balancing, and two-party completion confirmation. |
| Channels | Campus clubs, sustainability societies, orientation events, student ambassadors, and social media. |
| Revenue | Keep core exchanges free. Test a proposed Pro tier at ₹49/month or ₹399/year and campus event sponsorship; prices and willingness to pay are unvalidated. No current revenue is claimed. |
| Costs | Cloud hosting, database and storage, domain, moderation, support, and campus outreach. |
| Key metrics | Verified sign-ups, listings per active member, request-to-accept rate, completed exchanges, repeat exchange rate, dispute rate, and cost per completed exchange. |
| Unfair advantage | Campus-level density and trust relationships; this is a hypothesis to validate, not an established moat. |

## Business Model Canvas

| Building block | Closet Cycle model and validation need |
| --- | --- |
| Customer segments | Primary: students and campus members looking for affordable clothing variety. Supply side: members with wearable items to exchange. Validate both sides separately in campus interviews. |
| Value propositions | Find local pre-owned clothing; choose a direct swap or internal-credit exchange; complete handover through member coordination. No measured environmental benefit is claimed. |
| Channels | Campus sustainability clubs, orientation and swap events, student ambassadors, campus social accounts, and referral links shared by opted-in members. |
| Customer relationships | Self-serve listings and exchanges, clear status notifications, safety guidance, and a staffed report/contact path before a live pilot. |
| Revenue streams | Proposed experiments: optional Closet Cycle Pro at illustrative prices of ₹49/month or ₹399/year, plus campus swap-event sponsorship. Core browsing and exchanges stay free. Validate demand, costs, and fairness before launch; no current revenue or sponsor is claimed. |
| Key resources | Web application, Java API, listing and exchange data, image storage, campus partners, moderation capacity, and a trusted brand. |
| Key activities | Maintain listings and exchange flow, recruit both sides of the marketplace, moderate reports, support safe handover, and measure retention and completion. |
| Key partnerships | Campus clubs and sustainability office; later, approved hosting, storage, and payment vendors if the business model changes. No partner agreement is claimed. |
| Cost structure | Hosting, managed database, image storage and transfer, domain, moderation/support, campus outreach, and maintenance. Use calculator estimates and a budget alert before deployment. |

This canvas is a set of hypotheses, not evidence of validated customers, revenue, or partnerships. Interview results and pilot measurements belong in the user research record.

## Business model and platform flow

1. A member registers and receives a starting balance of prototype credits.
2. The member lists a garment with photos, size, condition, description, area, and suggested credit value.
3. A requester chooses a direct swap or a credit exchange. The owner accepts or declines.
4. After acceptance, both members arrange a public meetup or self-managed delivery.
5. Each member confirms only after handover. The system settles credits after both confirmations and marks listings exchanged.

The prototype stores listing reports and lets a moderator resolve or dismiss them; it does not suspend accounts or automatically remove reported listings. The Pro page is a local demo: it shows UPI, card, and net-banking choices and can set a browser-only demo flag, but it does not collect payment details, call a payment gateway, or charge money. For a real pilot, use a provider-hosted checkout in sandbox mode first; never handle card data directly. Review current gateway fees, taxes, refunds, consumer protection, subscriptions, and payment requirements with qualified local advisers before launch.

## Market validation plan

Do not use an unsupported total-market number. Run a campus pilot and measure supply and completion first. Interview 10–15 students about unused clothing, trust, sizing, and meetup preferences. Recruit 30–50 pilot members and target at least 50 complete, quality-checked listings. Observe the first 20 exchange requests; record acceptance, completion, time-to-match, and reason for abandonment. These are proposed research targets, not completed research results.

## SWOT

| Strengths | Weaknesses |
| --- | --- |
| Local community can make handovers easier; direct swaps and credit balance add flexibility; the prototype has a full exchange workflow. | Marketplace liquidity is unproven; item condition and sizing are self-reported; manual meetups create coordination friction; moderation and identity checks are limited. |
| Opportunities | Threats |
| --- | --- |
| Campus sustainability partnerships, student clubs, seasonal swap events, and later expansion to nearby campuses after validation. | Low listing density, unsafe handovers, counterfeit or inaccurate listings, harassment, privacy incidents, and established resale platforms. |

## PESTEL

| Factor | Closet Cycle consideration |
| --- | --- |
| Political | Campus rules, student organization policies, and local consumer or platform rules may affect operation. |
| Economic | Students are price-sensitive; credits can reduce cash friction but require clear rules to avoid perceived stored value. |
| Social | Trust, size inclusion, stigma around pre-owned goods, and safe meetup habits affect adoption. |
| Technological | Authentication, secure uploads, database backups, access controls, monitoring, and accessible mobile UX are required. |
| Environmental | Reuse may extend garment life, but impact claims need measured evidence and must not imply every swap displaces a new purchase. |
| Legal | Privacy, consent, online platform responsibilities, intellectual property, consumer terms, and payment treatment need jurisdiction-specific review before public launch. |

## Funding and launch plan

Start with a no-revenue campus pilot funded by a small student project budget, department support, or a sustainability grant. Avoid raising outside investment before pilot retention, match rate, safe completion, and operating costs are measured. A later funding request should state the amount, runway, use of funds, and milestone unlocked. No funding amount or investor commitment is asserted in this pack.

## DPIIT and intellectual property readiness

DPIIT recognition is an India-specific company/startup process, not a status this student prototype can claim. A team wishing to pursue it must first select an eligible legal entity, obtain required registrations, confirm current eligibility and portal requirements, and apply through the official Startup India process. Verify current rules before submission.

Before any public launch, the team should document original authorship, retain source and design history, cite third-party libraries and assets, check the Closet Cycle name and logo for conflicts, and obtain written permission for all user photos and testimonials. This report does not provide legal advice and does not claim a trademark, patent, incorporation, or DPIIT recognition.

## E-commerce safety and legal checklist

- Publish clear terms, privacy notice, community guidelines, item condition standards, and a support/report path.
- Collect only the data needed for accounts and exchanges; obtain meaningful consent and explain retention and deletion.
- Never display full home addresses. Use a broad meetup area and public, well-lit locations.
- Do not fabricate reviews, scarcity, environmental impact, or member counts. Label fictional demo content.
- Avoid dark patterns: no preselected paid add-ons, misleading countdowns, hidden fees, or obstructed account closure.
- Keep payment gateway out of the MVP. If later enabled, use provider-hosted checkout and sandbox tests first.
- Provide a moderation response process and an incident contact. Define evidence retention and appeals before handling real reports.
- Review applicable privacy, consumer, intermediary/platform, tax, accessibility, and payment rules with local counsel.

## Demo and viva outline

Five-minute sequence: (1) show the animated landing page and explain the campus problem, (2) browse and filter a live listing, (3) sign in as two seeded demo users and create/accept a request, (4) arrange and confirm from both accounts, then show the credit ledger settlement, (5) explain the Java model and cloud architecture, (6) disclose what remains a prototype and ask the panel for pilot feedback.

## Release state and evidence

This repository includes the application source, Java API, container configuration, cloud infrastructure source, CI workflow, test code, and test plan. The infrastructure has not been applied to an account. The current local verification passed 18 Java API integration tests, TypeScript checking, frontend production build, Terraform validation, and five local API smoke checks; see `TEST_EXECUTION_LOG.md`. Docker and cloud deployment are outstanding. Before a graded demo, the team should deploy with approved team credentials and capture the live smoke test.

See `SEM5_ASSIGNMENT_CROSSWALK.md` for the requirement-by-requirement completion status and external dependencies.

## Team completion checklist

- [ ] Assign team members to product, backend/cloud, testing, and pitch/report roles.
- [ ] Replace fictional/demo content and set the actual team, institution, date, and presenter names.
- [ ] Collect consented user research and fill in `USER_RESEARCH_PLAN.md` with actual anonymized evidence.
- [ ] Obtain mentor/team approval for `TOPIC_PROPOSAL.md`.
- [ ] Review `ECOMMERCE_DESIGN.md` with the mentor and confirm the payment and handover policy.
- [ ] Run the remaining test suite and fill in `TEST_EXECUTION_LOG.md` with real results and defects.
- [ ] Review privacy, terms, consent, name/IP, and legal points with the mentor.
- [ ] Obtain approval for cloud spend; set budget alerts; deploy and capture proof.
- [ ] Capture cloud monitoring evidence, actual calculator estimates, and post-deployment smoke results.
- [ ] Record a five-minute demo and rehearse a 10–12 slide pitch with a clear ask.
