# Five-minute Closet Cycle demo

## 0:00–0:35 — Problem and product

Show the landing page. Explain that students have wearable clothing they no longer use and direct swaps can be difficult to value. Closet Cycle is a campus marketplace that lets members swap directly or use internal credits. Do not claim measured waste reduction.

## 0:35–1:20 — Browse and inspect

Open Browse. Filter by category, size, condition, color, and credit cap. Open a listing and point out condition, broad location, and safety guidance. Explain that listing photos are demo data.

## 1:20–2:00 — Create a listing

Sign in as Maya using the local demo account. Open Wardrobe and show live listings. Create one test garment with a small JPEG/PNG/WebP. Demonstrate the honesty checkbox and publish. Show it in Browse.

## 2:00–3:15 — Exchange lifecycle

Open a different seeded listing, request it using credits or a direct offer, and show the pending request. Sign out and sign in as the owner, accept the request, and mark the handover arranged. Sign in as the requester and confirm completion, then as the owner for the second confirmation. Show the request as completed.

## 3:15–4:05 — Credit and Java implementation

Show Wallet activity after settlement. Explain the transaction: exchange rows and user rows are locked during settlement; the ledger records each transfer only once after both confirmations. Point to the Java model inheritance, repository interfaces, custom exceptions, and bounded async notification executor.

## 4:05–5:00 — Cloud, evidence, and ask

Show the architecture and test plan. If actually deployed, open HTTPS URL and health/logs; otherwise explicitly say the deployment is prepared in Terraform but not yet live. State real test and pilot results only. Ask the panel for feedback on campus trust, test cohort recruitment, and an approved pilot budget.

## Backup demo checklist

- Reset the database only after backing up required evidence; verify seeded users and listings.
- Confirm the API health endpoint and frontend-to-API CORS before the panel enters.
- Use fictional data and no private addresses.
- Have screenshots or a local demo ready if campus Wi-Fi fails; label offline screenshots as recorded prototype evidence.
- Keep the two demo passwords private to the team and rotate them before any public deployment.
