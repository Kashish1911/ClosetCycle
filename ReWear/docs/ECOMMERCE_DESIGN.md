# Closet Cycle e-commerce design

## Product and customer journey

1. A campus member discovers Closet Cycle through an approved campus channel and reads the safety and exchange rules.
2. They register with an email and broad campus area, then browse available items by category, size, condition, and credit cap.
3. An owner creates a listing with an honest description, condition, size, suggested internal-credit value, and rights-cleared photos.
4. A requester chooses a direct swap or credit exchange. The listing owner accepts or declines.
5. After acceptance, both members coordinate their own handover in a public campus location. Closet Cycle does not dispatch a courier or collect an address.
6. Each participant confirms only after handover. The application completes the exchange and records the credit ledger only after both confirmations.
7. Members can report a listing. A designated moderator reviews reports under a published response process.

## Business model and revenue hypotheses

Keep core browsing, standard listings, and exchanges free. A proposed optional Closet Cycle Pro tier could offer additional listing capacity, saved searches and match alerts, optional spotlight controls, and a personal exchange summary. Use ₹49/month or ₹399/year only as illustrative student-price hypotheses for the prototype; validate willingness to pay and feature value before launch. Campus clothing-swap event sponsorship is a second possible revenue stream. No current revenue, paid member, sponsor, or partnership is claimed.

## Payment approach

The Pro page contains a classroom checkout simulation with UPI, debit/credit cards, and net banking as selectable options. Its activation action stores a demo-only flag in the browser; it does not collect payment credentials, connect to a gateway, create a real subscription, or charge money. Internal exchange credits are non-purchasable prototype accounting units that cannot be withdrawn or used outside Closet Cycle; do not market them as money, deposits, or stored monetary value. For an actual pilot, use provider-hosted checkout and sandbox mode first, compare current fees (including GST and recurring-payment charges), and obtain mentor and local legal review before accepting money.

For a low-cost student demo, keep the checkout simulation only. Razorpay's official documentation says its test mode uses no real money; it can be explored separately if a later technical demonstration needs a hosted sandbox. Live gateway pricing varies by payment instrument and account: estimate charges using the provider's current terms rather than assuming that UPI or cards are free. Do not enable live mode or recurring billing in this prototype.

## Logistics and handover

Closet Cycle is a member-coordinated exchange platform, not a delivery service. The application records exchange state but does not book couriers, calculate shipping, verify identities, or guarantee handover. Members should select a public, well-lit campus place, avoid sharing home addresses, agree on timing in their own channel, and confirm only after inspecting and receiving the item. Before a real pilot, the team must publish safety guidance, a contact route, a report response target, and an incident/appeal process. Measure cancellation and no-show rates before considering delivery partners.

## Digital marketing plan

| Stage | Tactic | Measurement |
| --- | --- | --- |
| Awareness | Ask campus sustainability clubs and student societies to share a short, factual launch post; seek approval before using campus channels. | Reach and referral visits by approved channel. |
| Supply seeding | Run an opt-in listing clinic or clothing-swap table where members photograph items and create listings themselves. | Complete, quality-checked listings and listing activation rate. |
| First exchange | Provide a short explainer showing filters, swap/credit choices, safety guidance, and two-party confirmation. | Browse-to-request and request-to-accept rates. |
| Retention | Send only consented service updates; share new listing summaries without exposing member data. | Repeat active members and completed exchanges per active member. |
| Trust | Publish clear rules for condition, photos, meetup safety, reporting, and moderator response. | Report rate, resolution time, cancellations, and member feedback. |

No campaign has been run and no acquisition result is claimed. Use opt-in communications, approved campus channels, accurate statements, and no fake reviews, fabricated scarcity, unsupported waste/emissions claims, or undisclosed sponsorship.

## Legal, privacy, and security checklist

- Publish reviewed terms, privacy notice, community standards, item-condition guidance, contact path, retention/deletion process, and moderation/appeal process before a real pilot.
- Collect only data needed to operate accounts and exchanges; use broad campus areas and never publish home addresses.
- Accept photos only when the uploader has rights and consent; label all seed listings as fictional.
- Enforce authenticated ownership and moderator authorization; store password hashes, use HTTPS and managed secrets in production, and keep database/storage private.
- Do not claim identity verification, guaranteed safety, legal compliance, carbon savings, or partner endorsement without evidence.
- Do not introduce real-money payment or delivery features until policy, legal, security, and operational reviews are complete.
