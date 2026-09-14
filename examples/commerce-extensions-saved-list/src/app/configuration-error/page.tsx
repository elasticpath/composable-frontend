import { missingEnvRequirements } from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

/**
 * What a reader sees when the store or the environment is not ready.
 *
 * The saved list is the subject of this example, so anything it needs is
 * reported here by name. Nothing is swallowed into an empty panel.
 */
export default async function ConfigurationError() {
  const missing = missingEnvRequirements(process.env)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">
        There is a problem with the stores setup
      </h1>

      {missing.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            These environment variables are not set:
          </p>
          <ul className="space-y-3">
            {missing.map((requirement) => (
              <li
                key={requirement.name}
                className="rounded border border-gray-200 bg-white p-4"
              >
                <p className="font-mono text-sm">{requirement.name}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {requirement.remedy}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p>
            Every environment variable is set, so the problem is in the store
            itself. Check, in this order:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              The saved list Custom API exists. Run{" "}
              <code className="font-mono">pnpm provision</code> with admin
              credentials in your shell if it does not.
            </li>
            <li>The catalog is published and the API key can read it.</li>
            <li>
              The password profile named by{" "}
              <code className="font-mono">NEXT_PUBLIC_PASSWORD_PROFILE_ID</code>{" "}
              exists on an authentication realm.
            </li>
          </ul>
          <p className="mt-3">
            The README lists all of this under Store Setup Requirements.
          </p>
        </div>
      )}
    </div>
  )
}
