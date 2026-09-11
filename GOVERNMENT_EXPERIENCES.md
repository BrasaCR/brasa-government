# BRASA Government-powered experiences

The first public service provides anonymous civic navigation over the existing Costa Rica index. Results preserve their source URL, remain marked `unreviewed-existing-index`, and are informational—not eligibility decisions, legal advice, official endorsements, or proof of current availability.

It accepts only visitor-entered search, category, country, and limit values. Unsupported countries fail closed. `npm run build` produces a restricted public asset directory that excludes Worker source, tests, documentation, configuration, and functions.

Staging uses the separately named `brasa-government-staging` Worker. Its manual GitHub workflow requires a protected staging environment, builds restricted assets, tests and packages before deployment, and smoke-tests the staged health and civic-service endpoints. No production deployment command is included.
