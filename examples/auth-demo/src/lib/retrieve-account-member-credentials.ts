type AccountMemberCredentials = {
  token: string
  expires: string
  type: string
  selected?: string
  accounts: {
    [key: string]: {
      account_id: string
      account_member_id: string
      expires: string
    }
  }
}

export function retrieveAccountMemberCredentials(
  cookieStore: { get: (name: string) => { value: string } | undefined },
  cookieName: string,
): AccountMemberCredentials | null {
  try {
    const cookie = cookieStore.get(cookieName)
    if (!cookie) {
      return null
    }

    const credentials = JSON.parse(cookie.value) as AccountMemberCredentials

    // Check if credentials or token have expired
    const expiryDate = new Date(credentials.expires)
    if (expiryDate < new Date()) {
      return null
    }

    return credentials
  } catch (error) {
    console.error("Error parsing account member credentials", error)
    return null
  }
}
