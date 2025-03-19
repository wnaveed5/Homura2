# skeleton

## 2025.1.2

### Patch Changes

- Bump cli version ([#2760](https://github.com/Shopify/hydrogen/pull/2760)) by [@rbshop](https://github.com/rbshop)

- Updated dependencies [[`128dfcd6`](https://github.com/Shopify/hydrogen/commit/128dfcd6b254a7465d93be49d3bcbff5251e5ffc)]:
  - @shopify/hydrogen@2025.1.2

## 2025.1.1

### Patch Changes

- Upgrade eslint to version 9 and unify eslint config across all packages (with the exception of the skeleton, which still keeps its own config) ([#2716](https://github.com/Shopify/hydrogen/pull/2716)) by [@liady](https://github.com/liady)

- Bump remix version ([#2740](https://github.com/Shopify/hydrogen/pull/2740)) by [@wizardlyhel](https://github.com/wizardlyhel)

- Turn on Remix `v3_singleFetch` future flag ([#2708](https://github.com/Shopify/hydrogen/pull/2708)) by [@wizardlyhel](https://github.com/wizardlyhel)

  Remix single fetch migration quick guide: https://remix.run/docs/en/main/start/future-flags#v3_singlefetch
  Remix single fetch migration guide: https://remix.run/docs/en/main/guides/single-fetch

  **Note:** If you have any routes that appends (or looks for) a search param named `_data`, make sure to rename it to something else.

  1. In your `vite.config.ts`, add the single fetch future flag.

     ```diff
     +  declare module "@remix-run/server-runtime" {
     +    interface Future {
     +     v3_singleFetch: true;
     +    }
     +  }

       export default defineConfig({
         plugins: [
           hydrogen(),
           oxygen(),
           remix({
             presets: [hydrogen.preset()],
             future: {
               v3_fetcherPersist: true,
               v3_relativeSplatPath: true,
               v3_throwAbortReason: true,
               v3_lazyRouteDiscovery: true,
     +         v3_singleFetch: true,
             },
           }),
           tsconfigPaths(),
         ],

