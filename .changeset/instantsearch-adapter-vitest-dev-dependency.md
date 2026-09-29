---
"@elasticpath/catalog-search-instantsearch-adapter": patch
---

Remove `vitest` from the runtime dependencies, and stop publishing the compiled test files.

3.0.1 listed `vitest` under `dependencies`, so every install also installed `vitest` and `vite` 7. `vite` 7 requires Node `^20.19.0 || >=22.12.0`, and Yarn 1 stops the install on Node 18 with an engine error. The runtime code never loads `vitest`. Only the `*.test.ts` files import it, and the build compiled them into `dist`. The build now excludes those files, and `vitest` is a dev dependency.
