export const epccEnv = resolveEpccEnv();

function resolveEpccEnv(): {
  client_id: string;
  host?: string;
  client_secret?: string;
} {
  const { host, client_id, client_secret } = {
    host: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID,
    client_secret: process.env.EPCC_CLIENT_SECRET,
  };

  if (!client_id) {
    throw new Error(
      `Failed to get Elasticpath Commerce Cloud client_id environment variables client_id: ${client_id}\n Make sure you have set NEXT_PUBLIC_EPCC_CLIENT_ID`
    );
  }

  return { host, client_id, client_secret };
}
