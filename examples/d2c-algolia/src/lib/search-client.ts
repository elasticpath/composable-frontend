import algoliasearch from "algoliasearch/lite";
import { algoliaEnvData } from "./resolve-algolia-env";

export const searchClient = algoliasearch(
  algoliaEnvData.appId,
  algoliaEnvData.apiKey
);
