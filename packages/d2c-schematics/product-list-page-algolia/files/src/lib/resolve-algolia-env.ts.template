export const algoliaEnvData = algoliaEnv();

function algoliaEnv(): { appId: string; apiKey: string; indexName: string } {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;
  if (!appId || !apiKey || !indexName) {
    throw new Error(
      `Failed to get algolia search environment variables app id: ${appId} api key: ${apiKey} index name: ${indexName}\n Make sure you have set NEXT_PUBLIC_ALGOLIA_APP_ID, NEXT_PUBLIC_ALGOLIA_API_KEY and NEXT_PUBLIC_ALGOLIA_INDEX_NAME`
    );
  }
  return { appId, apiKey, indexName };
}
