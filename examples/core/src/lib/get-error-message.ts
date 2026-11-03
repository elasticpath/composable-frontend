type ApiErrorEntry = { title?: string; detail?: string };

function getApiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("errors" in error)) {
    return undefined;
  }

  if (!Array.isArray(error.errors)) {
    return undefined;
  }

  const messages = (error.errors as ApiErrorEntry[])
    .map((entry) => entry?.detail || entry?.title)
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join(" ") : undefined;
}

export function getErrorMessage(error: unknown): string {
  const apiMessage = getApiErrorMessage(error);

  if (apiMessage) {
    return apiMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong.";
}
