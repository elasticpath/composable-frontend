"use client";

import React, { useEffect, useState } from "react";
import { generateRedirectUri } from "../OidcUtilities";
import { oidcLogin } from "../actions";
import { useParams, useSearchParams } from "next/navigation";

export default function OIDCHandler() {
  const { lang } = useParams();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    async function setCustomerDataFromOidcCallback() {
      const codeVerifier = localStorage.getItem("code_verifier");
      const returnUrl = localStorage.getItem("returnUrl");

      if (code !== undefined && state !== undefined) {
        if (
          state === localStorage.getItem("state") &&
          typeof codeVerifier === "string"
        ) {
          await oidcLogin(
            code!,
            generateRedirectUri(),
            codeVerifier,
            lang as string,
            returnUrl as string,
          )
        } else {
          alert("Unable to validate identity");
        }

        localStorage.removeItem("location");
        localStorage.removeItem("state");
        localStorage.removeItem("returnUrl");
      }
    }

    setCustomerDataFromOidcCallback();
  }, [code, state]);

  return <div className="epminiLoader --center" />;
}
