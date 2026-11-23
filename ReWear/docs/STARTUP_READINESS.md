# Closet Cycle startup and e-commerce readiness

## MVP definition

The MVP tests whether one campus community can supply enough accurately described clothing and safely complete exchanges. Include member registration, browse/search/filter, listing creation and editing, direct swap and credit request, owner decision, handover arrangement, two-party completion, and a transparent credit ledger. Exclude commercial payments, shipping labels, cash payouts, identity verification claims, and automated trust scoring.

## Initial audience and acquisition

Begin with sustainability clubs and student communities at one institution. Recruit a small founding cohort, run an in-person clothing listing event, and use referral invitations that do not reward fake reviews. Track the source and conversion of each signup. Use permission-based photos and testimonials; label any demo fixture as fictional.

## Revenue experiments

Do not charge during initial validation. The current prototype now includes a simulated Pro pricing page to demonstrate a possible model: keep core exchanges free, then test an optional Pro tier at illustrative student prices of ₹49/month or ₹399/year. Candidate extras are more listings, saved searches/match alerts, optional listing spotlight controls, and an exchange summary. Campus-sponsored swap events are a second hypothesis. Neither pricing nor willingness to pay is validated, and the Pro toggle does not enforce feature limits. Internal credits must remain distinct from money unless legal and payment reviews explicitly change the model.

## Risk register

| Risk | Likelihood / impact | Mitigation and owner |
| --- | --- | --- |
| Low listing density | High / high | Launch in one campus cluster; seed listings through opt-in events; product lead tracks active supply. |
| Unsafe meetup | Medium / high | Public campus locations, no address sharing, safety guidance, reporting path; operations lead. |
| Misrepresented condition | Medium / medium | Required condition notes/photos, report workflow, repeat issue review; moderator. |
| Account or personal data exposure | Low / high | Minimal data, hashed passwords, access checks, TLS, private database, secret rotation; backend lead. |
| Credit double settlement | Low / high | Transactional locking, two-party confirmation, ledger audit, concurrency tests; backend lead. |
| Uncontrolled cloud cost | Medium / medium | Budget alert, single-region pilot, test teardown checklist, student credits verified first; cloud lead. |
| Unsupported environmental claim | Medium / medium | Do not claim avoided emissions until a defensible method and data exist; product lead. |

## Launch gates

1. Instructor review of the flow and terms.
2. Team has tested registration, listing, request, cancellation, completion, and permissions.
3. A moderator owns reports and response hours.
4. Privacy notice, retention/deletion behavior, consent language, and contact route are reviewed.
5. Public deployment uses HTTPS, managed secrets, private database, backups, logs, alarms, and a cost budget.
6. The Pro page's UPI/card/net-banking choices are mock UI only. Live payment features remain disabled unless provider-hosted sandbox tests, budget checks, and legal review are complete.

## Team and presentation placeholders

Replace before submission: institution, course, team member names/roles, instructor, actual pilot results, cloud account and region, actual monthly estimate, deployment URL, screenshot evidence, and requested funding/support. Do not imply an incorporation, customer count, user interview, measured impact, or investor commitment that has not occurred.
