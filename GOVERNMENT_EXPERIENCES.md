# BRASA Government-powered experiences

The first public service provides anonymous civic navigation over the existing Costa Rica index. Results preserve their source URL, remain marked `unreviewed-existing-index`, and are informational—not eligibility decisions, legal advice, official endorsements, or proof of current availability.

It accepts only visitor-entered search, category, country, and limit values. Unsupported countries fail closed. `npm run build` produces a restricted public asset directory that excludes Worker source, tests, documentation, configuration, and functions.

Staging uses the separately named `brasa-government-staging` Worker. Its manual GitHub workflow requires a protected staging environment, builds restricted assets, tests and packages before deployment, and smoke-tests the staged health and civic-service endpoints. No production deployment command is included.

## Service navigator

The first guided experience is `GET /api/v1/experiences/service-navigator` and `/service-navigator.html`. It accepts a locale, Costa Rica country code, a bounded result limit, and one curated topic (`water`, `health`, `education`, `business`, `transport`, or `housing`). It intentionally accepts no free-text narrative, identity, location, application, or eligibility data.

The experience presents four bilingual wayfinding steps and possible catalog sources. Every result retains `unreviewed-existing-index`; the response explicitly states that it is informational, is not an official service, requests no personal data, and makes no legal or eligibility decision. Applications and transactions remain with the responsible authority.
