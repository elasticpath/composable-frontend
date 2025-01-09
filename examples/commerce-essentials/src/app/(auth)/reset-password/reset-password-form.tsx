'use client'
import { useFormState } from "react-dom";
import { resetPassword } from "../actions";
import { Label } from "../../../components/label/Label";
import { Input } from "../../../components/input/Input";
import { FormStatusButton } from "../../../components/button/FormStatusButton";
import { ResourcePage,AccountTokenBase } from "@elasticpath/js-sdk";

export default function PasswordResetForm({
    accountTokens,
    userAuthInfoId,
    authenticationRealmId,
    passwordProfileId,
    userAuthenticationPasswordProfileInfoId
  }: {
    accountTokens: ResourcePage<AccountTokenBase>;
    userAuthInfoId?: string;
    authenticationRealmId?: string,
    passwordProfileId?: string
    userAuthenticationPasswordProfileInfoId?:string
  }){
    const initialState = {
        message: '',
      }

    const boundResetPassword = resetPassword.bind(null, accountTokens);
    const [state, formAction] = useFormState(boundResetPassword, initialState)

    return (
        <>
            <form className="space-y-6" action={formAction}>
                <input type="hidden" name="userAuthenticationInfoId" value={userAuthInfoId!} />
                <input type="hidden" name="authenticationRealmId" value={authenticationRealmId!} />
                <input type="hidden" name="passwordProfileId" value={passwordProfileId!} />
                <input type="hidden" name="userAuthenticationPasswordProfileInfoId" value={userAuthenticationPasswordProfileInfoId!} />
                <div>
                    <Label htmlFor="password1">New Password</Label>
                    <div className="mt-2">
                        <Input
                            id="password1"
                            name="password1"
                            type="password"
                            required
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="password2">Repeat New Password</Label>
                    <div className="mt-2">
                        <Input
                            id="password2"
                            name="password2"
                            type="password"
                            required
                        />
                    </div>
                </div>
                <div>
                    <FormStatusButton className="w-full">Reset Password</FormStatusButton>
                    <p aria-live="polite">{state?.message}</p>
                </div>
            </form>
        </>
    );
}