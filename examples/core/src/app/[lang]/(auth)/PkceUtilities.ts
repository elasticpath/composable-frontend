/*
 This file (and only this file) has been adapted from: https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html#L158 , and
 is MIT Licensed as a result.

 MIT License

 Copyright (c) 2019 Aaron Parecki

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
export interface PkceParameters {
    codeVerifier: string;
    codeChallenge: string;
}

export const generateCodeVerifierAndS256Challenge = () : Promise<PkceParameters> => {
    const codeVerifier : string = generateRandomString();

    return pkceChallengeFromVerifier(codeVerifier).then( (codeChallenge: string) => {
            return {
                codeVerifier: codeVerifier,
                codeChallenge: codeChallenge
            };
        }
    )
}


function generateRandomString() : string {
    let array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Calculate the SHA256 hash of the input text.
// Returns a promise that resolves to an ArrayBuffer
function sha256(plain : string) : PromiseLike<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

// Base64-urlencodes the input string
function base64urlencode(str : ArrayBuffer) : string {
    // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    var data : number[] = []
    for(var i = 0; i < str.byteLength; i++) {
        data = data.concat([new DataView(str).getUint8(i)]);
    }

    return btoa(String.fromCharCode.apply(null, data))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Return the base64-urlencoded sha256 hash for the PKCE challenge
async function pkceChallengeFromVerifier(v : string){
    const hashed = await sha256(v);
    return base64urlencode(hashed);
}

