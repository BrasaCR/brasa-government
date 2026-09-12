# BRASA Government-powered experiences

The first public service provides anonymous civic navigation over the existing Costa Rica index. Results preserve their source URL, remain marked `unreviewed-existing-index`, and are informational—not eligibility decisions, legal advice, official endorsements, or proof of current availability.

It accepts only visitor-entered search, category, country, and limit values. Unsupported countries fail closed. `npm run build` produces a restricted public asset directory that excludes Worker source, tests, documentation, configuration, and functions.

Staging uses the separately named `brasa-government-staging` Worker. Its manual GitHub workflow requires a protected staging environment, builds restricted assets, tests and packages before deployment, and smoke-tests the staged health and civic-service endpoints. No production deployment command is included.

## Service navigator

The first guided experience is `GET /api/v1/experiences/service-navigator` and `/service-navigator.html`. It accepts a locale, Costa Rica country code, a bounded result limit, and one curated topic (`water`, `health`, `education`, `business`, `transport`, or `housing`). It intentionally accepts no free-text narrative, identity, location, application, or eligibility data.

The experience presents four bilingual wayfinding steps and possible catalog sources. Every result retains `unreviewed-existing-index`; the response explicitly states that it is informational, is not an official service, requests no personal data, and makes no legal or eligibility decision. Applications and transactions remain with the responsible authority.

## Source review governance

Public services now have deterministic IDs derived from their catalog category and label. A private D1 registry binds each review to that stable ID and the exact source URL; if the catalog URL changes, public output automatically returns to `unreviewed-existing-index` until a new review is completed.

Review APIs live only under `/api/operator/v1/`. Identity issues a separate 15-minute `brasa-government-operator` session from a one-time invitation, and Government additionally requires an active named reviewer in its own registry. A review requires an HTTPS source, separate HTTPS evidence, five explicit attestations, a bounded reason, and an expiry no more than 366 days ahead. Successful reviews publish only review status, evidence URL, review time, and expiry. Reviewer identity and audit reasons remain private.

The staging registry begins empty. Deployment never promotes existing catalog links automatically, and a missing database or Identity binding fails closed.

### Reviewer onboarding and console

The staging-only reviewer administration tool establishes the initial trust boundary without embedding administrator credentials in the Worker. Bootstrap is permitted only while the reviewer registry is empty, requires an exact staging confirmation, and creates BRASA's single protected administrator. The administrator can request and approve a reviewer within 24 hours, but the tool cannot create another administrator. One-time invitation codes are generated locally; Identity stores only their SHA-256 digests.

The review console is served at `/operator/reviews`. It keeps the 15-minute reviewer token only in page memory, renders catalog and API values as text, and never persists credentials in browser storage. The document is always routed through the Worker so it receives `Cache-Control: no-store`, a restrictive Content Security Policy, `nosniff`, and a no-referrer policy. The console can search the public catalog and submit exact-source evidence, expiry, reason, and all five required attestations through the protected operator API.

The current staging registry intentionally remains empty. The sole real BRASA administrator must be identified by name and BRASA display ID before bootstrap, and no source should be marked reviewed until genuine review evidence is available.

Reviewer lifecycle commands are also local and staging-only. The sole administrator is protected from suspension. The administrator may suspend a non-administrator reviewer, which revokes every live Identity session and unused invitation for the target; reactivation deliberately requires a new invitation before access resumes. Pending onboarding requests are marked expired before the queue is displayed, and the content-free administration history can be inspected without exposing invitation or session secrets.

Operational commands use `npm run reviewers -- <command>`. Supported commands are `bootstrap`, `request`, `approve`, `invite`, `suspend`, `resume`, `list`, `pending`, and `history`; mutating commands require bounded reasons and named BRASA display IDs. The tool is fixed to the staging Government and Identity databases and is not deployed as a public administration API.

Active source reviews can be suspended from the private console or `POST /api/operator/v1/reviews/{serviceId}/suspend` with a bounded audit reason. Suspension immediately removes the reviewed designation from public results. Elapsed reviews are likewise excluded from active results and appear as `expired` in the private registry view; re-reviewing the exact current source with new evidence is the only way to restore the public designation.
