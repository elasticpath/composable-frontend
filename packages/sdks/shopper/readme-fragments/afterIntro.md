## React Query Support

This SDK provides optional React Query hooks for React applications. To use them, you need to:

1. Install `@tanstack/react-query` as a peer dependency:
   ```bash
   npm install @tanstack/react-query
   # or
   pnpm install @tanstack/react-query
   # or
   yarn add @tanstack/react-query
   ```

2. Import hooks from the `/react-query` subpath:
   ```ts
   import { useGetByContextProduct } from "@epcc-sdk/sdks-shopper/react-query";
   ```

**Note**: If you're not using React or React Query, you can use the SDK without installing `@tanstack/react-query`. The main exports work independently.