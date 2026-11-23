# Closet Cycle Java API

Spring Boot REST API for Closet Cycle's semester-project prototype. It covers authentication, user profiles, clothing listings, exchange requests, credit settlement, and image uploads. The React UI connects to this API when it is running locally.

## Requirements

- Java 25 LTS
- Maven 3.6.3 or later

Spring Boot 3.5.x supports Java 17 through 25; this project targets Java 25 LTS. See the [Spring Boot system requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html).

## Run locally

From this directory:

```powershell
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. On first run it creates a local H2 database under `data/`, a local `uploads/` directory, and fictional demo users/listings. Health status is at `/actuator/health`. The H2 console is available at `/h2-console` for local development only.

## Main endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a profile and return a short-lived JWT |
| `POST` | `/api/auth/login` | Authenticate and return a short-lived JWT |
| `GET` | `/api/users/{id}` | Read your own profile and credit balance |
| `GET` | `/api/items` | Browse available listings; optional `q`, `category`, `size`, `condition`, `color`, `maxCredits` filters |
| `GET` | `/api/items/{id}` | Read a listing |
| `GET` | `/api/items/owner/{userId}` | List a user's listings |
| `POST` | `/api/items` | Create a listing |
| `POST` | `/api/files/images` | Upload JPEG, PNG, or WebP image, max 10 MB |
| `POST` | `/api/exchanges` | Request a direct swap or credit exchange |
| `GET` | `/api/exchanges?userId={id}` | List a user's exchanges |
| `POST` | `/api/exchanges/{id}/accept?ownerId={id}` | Accept and reserve the requested/offered items |
| `POST` | `/api/exchanges/{id}/decline?ownerId={id}` | Decline a pending request |
| `POST` | `/api/exchanges/{id}/cancel?requesterId={id}` | Cancel a pending request |
| `POST` | `/api/exchanges/{id}/arrange?participantId={id}` | Mark a handover arrangement |
| `POST` | `/api/exchanges/{id}/confirm?participantId={id}` | Confirm completion; both participants must confirm before credits/items settle |
| `GET` | `/api/wallet/{userId}` | Read balance |
| `GET` | `/api/wallet/{userId}/activity` | Read credit transaction history |
| `POST` | `/api/items/{itemId}/reports` | File a report about another member's listing |
| `GET` | `/api/admin/reports` | Moderator-only report queue |
| `PATCH` | `/api/admin/reports/{id}?status=RESOLVED` | Moderator resolves or dismisses a report |

Development demo users on a fresh non-production database: Maya (`maya@closetcycle.local`, id 1), Amara (`amara@closetcycle.local`, id 2), and Leo (`leo@closetcycle.local`, id 3). Their demo passwords are `demo-password-1`, `demo-password-2`, and `demo-password-3`; change them before sharing any demo environment. Each starts with 200 internal swap credits. Sign in first:

```json
{ "email": "maya@closetcycle.local", "password": "demo-password-1" }
```

Then send the returned token as `Authorization: Bearer <accessToken>`. For example, Maya can request Amara's first listing with a direct offer:

```json
{
  "requesterId": 1,
  "requestedItemId": 1,
  "type": "DIRECT_SWAP",
  "offeredItemId": 7
}
```

For a credit exchange, use `"type": "CREDITS"` and omit `offeredItemId`. Credits are transferred only after both participants confirm the arranged exchange.

## Java concepts demonstrated

- Object-oriented domain models: `UserAccount`, `ClothingItem`, `ExchangeRequest`, and `CreditTransaction`.
- Inheritance: shared creation/update timestamps in the JPA `AuditedEntity` mapped superclass.
- Interfaces: repository contracts and the `NotificationService` interface.
- Custom exceptions: missing resource, invalid exchange, and insufficient credit cases, mapped to clear HTTP errors.
- Multithreading: exchange notifications run on a bounded Spring `ThreadPoolTaskExecutor`.
- File management: image uploads are validated and saved to a local upload directory for the prototype.
- Database connectivity: Spring Data JPA with H2 locally; JDBC URL and credentials can be supplied through environment variables for a managed PostgreSQL deployment.
- Concurrent exchanges: item, user, and exchange rows are locked while reservation and credit settlement are performed.

## Configuration and current prototype limits

Supported environment variables: `PORT`, `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `UPLOAD_DIR`, and `CLOSET_CYCLE_JWT_SECRET`. Use an external managed database and object storage for cloud deployment. The included local upload storage is not durable cloud object storage.

Authentication uses BCrypt password hashes and six-hour signed JWTs. Member/moderator roles are represented in JWT claims; admin-only API paths require the moderator role. User IDs are checked against the authenticated token for wallet, listing, and exchange actions. The local profile creates a random in-memory signing key when `CLOSET_CYCLE_JWT_SECRET` is omitted, so tokens expire on server restart. Production requires a base64-encoded secret of at least 32 bytes, HTTPS, production CORS, database migrations, backups, and managed object storage.

The prototype does not include email verification, password reset delivery, payment processing, account suspension, or a moderator audit log. It stores listing reports and lets moderators resolve/dismiss them; it does not automatically remove content or suspend accounts. Demo seed data is fictional and disabled in the `prod` profile.

For a controlled demo only, create the moderator account through registration and promote it through an authorized database administrator using `UPDATE user_accounts SET role = 'MODERATOR' WHERE email = '<team-controlled-email>';`, then sign in again to receive a moderator token. Do not expose this SQL as a public API or use a shared demo password on a public deployment.

To run the containerized local PostgreSQL setup, set `DATABASE_PASSWORD` and `CLOSET_CYCLE_JWT_SECRET` in the shell, then run `docker compose up --build` from this directory. Never commit real values.
