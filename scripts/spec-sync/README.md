# spec-sync

Keeps the specs in `packages/sdks/specs/` in step with the OpenAPI specs Elastic Path
publishes at `developer.elasticpath.com/assets/openapispecs/`, and the generated clients in
step with those specs.

`.github/workflows/spec-sync.yml` runs this on a schedule. For each spec whose published
version differs from ours, it refreshes the working spec, regenerates the affected clients,
writes a changeset and opens a **draft** pull request. A human merges it, and merging is what
publishes to npm.

## Run it by hand

```bash
pnpm install --frozen-lockfile
node scripts/spec-sync/fetch-upstream.mjs --list          # what has changed upstream
node scripts/spec-sync/fetch-upstream.mjs --spec pim      # download one spec
node scripts/spec-sync/sync-spec.mjs --spec pim           # refresh, regenerate, changeset
```

`--dry-run` stops `sync-spec` before it touches the working spec. `SPEC_SYNC_BASELINE`
overrides the ref the export diff compares against (default `origin/main`).
`SPEC_SYNC_BASE_URL` overrides where specs are downloaded from.

## What it does

1. Reads the row for the spec from `packages/sdks/specs/config/canonical-map.json`, and
   refuses anything whose `divergence` is not `none`. Those differ from the published spec on
   purpose and need a rule engine that does not exist yet.
2. Downloads the published spec into `packages/sdks/specs/upstream/<path>`. The docs site
   answers `200` with an HTML page for a path that does not exist, so the body is checked for
   an `openapi:` line rather than the status code.
3. Records the exported symbols the affected packages expose on the baseline ref.
4. Copies the downloaded spec over the working spec and regenerates, forcing the build
   because the spec sits outside the package directory Turbo hashes.
5. Reverts the README churn every build produces, as `release.yml` already does.
6. Diffs the exports again. A removed symbol means breaking, a new symbol means minor,
   neither means patch. That bump goes into the changeset. A breaking regeneration holds the
   pull request as a draft and lists every symbol that disappeared.
7. Writes a summary JSON the workflow turns into the pull request body.

## Exit codes

`fetch-upstream.mjs`: 0 downloaded, 2 already current, 1 error.

`sync-spec.mjs`:

| Code | Meaning |
|---|---|
| 0 | Synced. Check `exportsRemoved` in the summary. |
| 2 | Working spec already matches the published one. |
| 3 | Spec carries a divergence no rule covers. Left untouched. |
| 4 | Published spec does not generate. Almost always a malformed spec. |
