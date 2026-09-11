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
