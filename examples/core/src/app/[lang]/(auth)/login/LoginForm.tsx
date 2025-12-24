"use client";

import { getOidcProfile, loadOidcProfiles, login } from "../actions";
import { Label } from "src/components/label/Label";
import { Input } from "src/components/input/Input";
import { FormStatusButton } from "src/components/button/FormStatusButton";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { generateOidcLoginRedirectUrl } from "../OidcUtilities";
import { useAuthentication } from "src/hooks/use-authentication";

export function LoginForm({ returnUrl }: { returnUrl?: string }) {
  const { lang } = useParams();
  const [error, setError] = useState<string | undefined>(undefined);

  async function loginAction(formData: FormData) {
    const result = await login(formData, lang as string);

    if ("error" in result) {
      setError(result.error);
    }
  }

  const [authenticationRealmId, setAuthenticationRealmId] = useState<
    string | undefined
  >(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [oidcProfiles, setOidcProfiles] = useState<any>();

  const { data } = useAuthentication() as any;

  useEffect(() => {
    const init = async () => {
      if (data) {
        const realmId = data?.relationships.authentication_realm?.data?.id;
        const profiles = await loadOidcProfiles(realmId);

        setClientId(data?.meta?.client_id);
        setAuthenticationRealmId(realmId);
        setOidcProfiles(profiles);
      }
    };
    init();
  }, [data]);

  const handleOidcButtonClicked = async (profile: any, cId: any) => {
    if (authenticationRealmId) {
      const { links } = await getOidcProfile(authenticationRealmId, profile.id);
      const baseRedirectUrl = links["authorization-endpoint"];
      window.location.href = await generateOidcLoginRedirectUrl(
        baseRedirectUrl,
        cId,
        location.pathname,
        lang as string,
        returnUrl
      );
    }
  };

  return (
    <form className="space-y-6" action={loginAction}>
      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <div className="text-sm">
            <a
              href="#"
              className="font-light text-brand-primary hover:text-brand-highlight"
            >
              Forgot password?
            </a>
          </div>
        </div>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </div>
      {returnUrl && (
        <input
          id="returnUrl"
          readOnly
          name="returnUrl"
          type="text"
          className="hidden"
          value={returnUrl}
        />
      )}
      {error && (
        <div className="mt-2">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      )}

      <div>
        <FormStatusButton className="w-full">Login</FormStatusButton>
      </div>

      {oidcProfiles &&
        oidcProfiles.data.map((profile: any) => {
          return (
            <FormStatusButton
              key={profile.id}
              type="button"
              className="w-full mt-4"
              onClick={() => handleOidcButtonClicked(profile, clientId)}
            >
              Login with {profile.name}
            </FormStatusButton>
          );
        })}
    </form>
  );
}
