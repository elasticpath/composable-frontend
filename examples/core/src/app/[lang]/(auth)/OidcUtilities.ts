import {generateCodeVerifierAndS256Challenge, PkceParameters} from './PkceUtilities';

const generateStateToken = () => {
    var array = new Uint8Array(20);
    const randomValues = window.crypto.getRandomValues(array)
    return randomValues.join('');
}

export const generateRedirectUri = () => {
    const oidcHandlerRoute = encodeURI(`${window.location.origin}/oidc`)
    return `${oidcHandlerRoute}`
}

export const generateOidcLoginRedirectUrl = (baseRedirectUrl: string, cId: string, prevLocation: string, lang?: string, returnUrl?: string) : Promise<string> => {
    const stateToken = generateStateToken();

    // Set state and prevLocation for when oidc redirects back to the application.
    localStorage.setItem('state', stateToken);
    localStorage.setItem('location', prevLocation);

    if (returnUrl) localStorage.setItem('returnUrl', returnUrl);

    return generateCodeVerifierAndS256Challenge().then( (pkceParameters: PkceParameters) => {
        localStorage.setItem('code_verifier', pkceParameters.codeVerifier)
        let url = new URL(baseRedirectUrl);
        url.searchParams.append("client_id", cId);
        url.searchParams.append("redirect_uri", generateRedirectUri());
        url.searchParams.append("state", stateToken);
        url.searchParams.append("response_type", "code");
        url.searchParams.append("scope", "openid email profile");
        url.searchParams.append("code_challenge_method","S256");
        url.searchParams.append("code_challenge", pkceParameters.codeChallenge);

        return url.toString();
    });
}

export const getAuthorizationEndpointFromProfile = (profile: any):string =>{
    let authorizationEndpoint = profile?.meta?.discovery_document?.authorization_endpoint;
    return authorizationEndpoint.indexOf("?") ? `${authorizationEndpoint}&` : `${authorizationEndpoint}?`
}
