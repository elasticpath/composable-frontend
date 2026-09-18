# spec-sync (prototype)

Throwaway code answering one question: given an upstream OpenAPI spec landing on a
`spec-sync/<name>` branch, can a pull request come out the other side already carrying the
refreshed spec, the regenerated client, and a changeset, with anything that breaks a
published package held back? Not production code.

## Run it

```bash
pnpm install --frozen-lockfile
cp <an upstream spec> packages/sdks/specs/upstream/pricebooks/pricebooks.yaml
node scripts/spec-sync/sync-spec.mjs --spec pricebooks
```

`--dry-run` stops before touching the working spec. `SPEC_SYNC_BASELINE` overrides the ref
the export diff compares against (default `origin/main`).

## What it does

1. Reads the row for the spec from `packages/sdks/specs/config/canonical-map.json`, and
   refuses anything whose `divergence` is not `none`. Those need a rule engine that does
   not exist yet.
2. Records the exported symbols the affected packages expose on the baseline ref.
3. Copies `specs/upstream/<path>` over the working spec and regenerates, forcing the build
   because the spec sits outside the package directory Turbo hashes.
4. Reverts the README churn every build produces, as `release.yml` already does.
5. Diffs the exports again. A removed symbol means breaking, a new symbol means minor,
   neither means patch. That bump goes into the changeset.
6. Writes a summary JSON the workflow turns into the pull request body.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Synced. Check `exportsRemoved` in the summary. |
| 2 | Working spec already matches upstream. |
| 3 | Spec carries a divergence no rule covers. Left untouched. |
| 4 | Landed spec does not generate. Almost always a malformed spec. |
