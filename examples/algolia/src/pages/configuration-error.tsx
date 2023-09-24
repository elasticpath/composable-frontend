import Link from "next/link";
import { GetServerSideProps, NextPage } from "next";

interface IConfigurationError {
  from?: string;
  issues?: Record<string, string | string[]>;
}

export const ConfigurationError: NextPage = ({
  issues,
  from,
}: IConfigurationError) => {
  return (
    <div className="m-auto flex h-[36rem] w-full max-w-base-max-width flex-col items-center justify-center gap-4 p-8">
      <span className="text-center text-xl md:text-3xl">
        There is a problem with the stores setup
      </span>
      <Link
        href={from ? from : "/"}
        className="text-md text-brand-primary lg:text-lg"
      >
        Refresh
      </Link>
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
                      {(Array.isArray(issue) ? issue : [issue]).map(
                        (messsage) => (
                          <li className="break-words" key={messsage}>
                            {decodeURIComponent(messsage)}
                          </li>
                        ),
                      )}
                    </ul>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigurationError;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const {
    "missing-env-variable": missingEnvVariables,
    authentication,
    from,
  } = query;
  return {
    props: {
      issues: {
        ...(missingEnvVariables && { missingEnvVariables }),
        ...(authentication && { authentication }),
      },
      from: Array.isArray(from) ? from[0] : from,
    },
  };
};
