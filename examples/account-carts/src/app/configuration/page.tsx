import {
  DOCUMENTED_DEFAULT_CART_EXPIRY_DAYS,
  readCartExpiry,
} from "@/lib/cart-settings"
import { SHARES_SLUG } from "@/app/constants"
import { serverKeyEnv } from "@/lib/server-key-env"
import { sharesCustomApiStatus } from "@/lib/shares-store"
import { storeEnv } from "@/lib/store-env"
import {
  envRequirementProblems,
  missingCustomApiRequirement,
  missingServerKeyRequirements,
  type Requirement,
} from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

function RequirementList({ requirements }: { requirements: Requirement[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {requirements.map((requirement) => (
        <li
          key={requirement.name}
          className="rounded border border-gray-200 bg-white p-4"
        >
          <p className="font-mono text-sm">{requirement.name}</p>
          <p className="mt-1 text-sm text-gray-600">{requirement.remedy}</p>
        </li>
      ))}
    </ul>
  )
}

async function CartExpirySection() {
  const missingKey = missingServerKeyRequirements(serverKeyEnv())

  if (missingKey.length > 0) {
    return (
      <>
        <p className="text-sm text-gray-700">
          The store&apos;s cart settings need a server-only API key. Set these
          variables and restart:
        </p>
        <RequirementList requirements={missingKey} />
      </>
    )
  }

  const expiry = await readCartExpiry()

  if (expiry.status === "unreadable") {
    return (
      <p className="text-sm text-red-600">
        Could not read the store&apos;s cart settings. Check that the key in
        EPCC_CLIENT_ID and EPCC_CLIENT_SECRET is valid and can read settings,
        then reload.
      </p>
    )
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <p className="font-mono text-sm">cart_expiry_days</p>
      <p className="mt-1 text-2xl font-medium">
        {expiry.status === "set"
          ? `${expiry.days} ${expiry.days === 1 ? "day" : "days"}`
          : "Not set"}
      </p>
      {expiry.status === "not-set" ? (
        <p className="mt-1 text-sm text-gray-600">
          The store has not set a value. Elastic Path&apos;s API reference gives{" "}
          {DOCUMENTED_DEFAULT_CART_EXPIRY_DAYS} days as the default.
        </p>
      ) : null}
    </div>
  )
}

async function SharesSection() {
  const missingKey = missingServerKeyRequirements(serverKeyEnv())

  if (missingKey.length > 0) {
    return (
      <>
        <p className="text-sm text-gray-700">
          Share links are stored with a server-only API key. Set these variables
          and restart:
        </p>
        <RequirementList requirements={missingKey} />
      </>
    )
  }

  const status = await sharesCustomApiStatus()

  if (status === "missing") {
    return (
      <>
        <p className="text-sm text-gray-700">
          The store does not hold the Custom API that stores share links:
        </p>
        <RequirementList
          requirements={[missingCustomApiRequirement(SHARES_SLUG)]}
        />
      </>
    )
  }

  if (status === "unreadable") {
    return (
      <p className="text-sm text-red-600">
        Could not look up the share links Custom API. Check that the key in
        EPCC_CLIENT_ID and EPCC_CLIENT_SECRET is valid and can read Commerce
        Extensions, then reload.
      </p>
    )
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <p className="font-mono text-sm">Custom API &quot;{SHARES_SLUG}&quot;</p>
      <p className="mt-1 text-sm text-gray-600">
        Found. Share links can be made.
      </p>
    </div>
  )
}

export default function Configuration() {
  const storeProblems = envRequirementProblems(storeEnv())

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Configuration</h1>

      {storeProblems.length > 0 ? (
        <section>
          <p className="text-sm text-gray-700">
            The example cannot reach the store until these are set:
          </p>
          <RequirementList requirements={storeProblems} />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">How long a cart lasts</h2>
        <p className="text-sm text-gray-600">
          Elastic Path deletes a cart this many days after it was last changed.
          Each change moves the date; reading a cart does not. The setting
          applies to every cart in the store, so a saved cart lasts only this
          long.
        </p>
        <CartExpirySection />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Share links</h2>
        <p className="text-sm text-gray-600">
          A share link is stored as an entry in a Custom API. The store must
          hold that Custom API before a shopper can share a cart.
        </p>
        <SharesSection />
      </section>
    </div>
  )
}
