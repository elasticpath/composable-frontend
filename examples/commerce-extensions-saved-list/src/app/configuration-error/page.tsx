import { SAVED_LIST_SLUG } from "../constants"
import { resolveSavedListCustomApiId } from "@/lib/commerce-extensions-store"
import {
  missingCustomApiRequirement,
  envRequirementProblems,
  type Requirement,
} from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

/**
 * What a reader sees when the store or the environment is not ready.
 *
 * The saved list is the subject of this example, so anything it needs is
 * reported here by name. Nothing is swallowed into an empty panel.
 */
export default async function ConfigurationError() {
  const missing: Requirement[] = envRequirementProblems(process.env)

  // Only worth asking the store once the credentials to ask it with are set.
  if (missing.length === 0 && !(await customApiExists())) {
    missing.push(missingCustomApiRequirement(SAVED_LIST_SLUG))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">
        There is a problem with the stores setup
      </h1>

      {missing.length > 0 ? (
        <ul className="space-y-3">
          {missing.map((requirement) => (
            <li
              key={requirement.name}
              className="rounded border border-gray-200 bg-white p-4"
            >
              <p className="font-mono text-sm">{requirement.name}</p>
              <p className="mt-1 text-sm text-gray-600">{requirement.remedy}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p>
            Every requirement this example can check is met, so the problem is
            something it can only find by asking. Check, in this order:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              The catalog is published and the API key can read it. Without it
              there are no products to save.
            </li>
            <li>
              The password profile named by{" "}
              <code className="font-mono">NEXT_PUBLIC_PASSWORD_PROFILE_ID</code>{" "}
              exists on an authentication realm, and the account you are signing
              in as has a member on it.
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

async function customApiExists(): Promise<boolean> {
  try {
    return Boolean(await resolveSavedListCustomApiId())
  } catch {
    // The store could not be reached at all. That is a different fault, and the
    // checklist below covers it; do not claim the Custom API is missing.
    return true
  }
}
