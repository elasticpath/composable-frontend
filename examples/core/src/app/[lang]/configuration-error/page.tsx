import { LocaleLink } from "src/components/LocaleLink";
import { Metadata } from "next";
import {
  STORE_SHAPE_PARAM,
  parseStoreShapeProblems,
  storeShapeRequirement,
} from "src/lib/search-store-shape";
import { TAXONOMY_FACET_FIELD } from "src/lib/search-taxonomy-facet";

export const metadata: Metadata = {
  title: "Configuration Error",
  description: "Configuration error page",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ConfigurationErrorPage(props: Props) {
  const searchParams = await props.searchParams;
  const {
    "missing-env-variable": missingEnvVariables,
    authentication,
    from,
  } = searchParams;

  const issues: { [key: string]: string | string[] } = {
    ...(missingEnvVariables && { missingEnvVariables }),
    ...(authentication && { authentication }),
  };
  const fromProcessed = Array.isArray(from) ? from[0] : from;
  const storeShapeRequirements = parseStoreShapeProblems(
    searchParams[STORE_SHAPE_PARAM],
  ).map((problem) => storeShapeRequirement(problem, TAXONOMY_FACET_FIELD));

  return (
    <div className="m-auto flex h-[36rem] w-full max-w-base-max-width flex-col items-center justify-center gap-4 p-8">
      <span className="text-center text-xl md:text-3xl">
        There is a problem with the stores setup
      </span>
      <LocaleLink
        href={fromProcessed ? fromProcessed : "/"}
        className="text-md text-brand-primary lg:text-lg"
      >
        Refresh
      </LocaleLink>
      <table className="text-sm md:text-base">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {issues &&
            Object.keys(issues).map((key) => {
              const issue = issues[key];
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    <ul>
                      {(Array.isArray(issue) ? issue : [issue!]).map(
                        (message) => (
                          <li className="break-words" key={message}>
                            {decodeURIComponent(message)}
                          </li>
                        ),
                      )}
                    </ul>
                  </td>
                </tr>
              );
            })}
          {storeShapeRequirements.map(({ name, remedy }) => (
            <tr key={name}>
              <td className="break-words pr-4 align-top">{name}</td>
              <td className="break-words">{remedy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
