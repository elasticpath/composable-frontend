import { envRequirementProblems } from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

export default function ConfigurationError() {
  const problems = envRequirementProblems(process.env)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">
        There is a problem with the store&apos;s setup
      </h1>

      {problems.length > 0 ? (
        <ul className="space-y-3">
          {problems.map((requirement) => (
            <li
              key={requirement.name}
              className="rounded border border-gray-200 bg-white p-4"
            >
              <p className="font-mono text-sm break-all">{requirement.name}</p>
              <p className="mt-1 text-sm text-gray-600">{requirement.remedy}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p>
            Every setting this example can check is in place, so the problem is
            in the store. Check, in this order:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <code className="font-mono">NEXT_PUBLIC_EPCC_CLIENT_ID</code>{" "}
              belongs to a key on the store at{" "}
              <code className="font-mono break-all">
                NEXT_PUBLIC_EPCC_ENDPOINT_URL
              </code>
              , so the store issues an implicit token for it.
            </li>
            <li>
              The store has a published catalog that the shopper can read.
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
