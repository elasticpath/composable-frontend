import { z } from "zod";

export const accountMemberCredentialSchema = z.object({
  account_id: z.string(),
  account_name: z.string(),
  expires: z.string(),
  token: z.string(),
  type: z.literal("account_management_authentication_token"),
});

export type AccountMemberCredential = z.infer<
  typeof accountMemberCredentialSchema
>;

export const accountMemberCredentialsSchema = z.object({
  accounts: z.record(z.string(), accountMemberCredentialSchema),
  selected: z.string(),
  accountMemberId: z.string(),
});

export type AccountMemberCredentials = z.infer<
  typeof accountMemberCredentialsSchema
>;
