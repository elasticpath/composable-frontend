"use client";

import { useContext } from "react";
import { EventContext } from "../lib/event-context";
import { StoreEvent } from "../lib/event-types";
import { Observable } from "../lib/subject";

/**
 * Should be used to access the event stream and subscribe to events in the store.
 */
export function useEvent(): { events: Observable<StoreEvent> } {
  const ctx = useContext(EventContext);

  if (!ctx) {
    throw new Error("useEvent must be used within an EventProvider");
  }

  return {
    events: ctx.events$,
  };
}

export function useNotify() {
  const ctx = useContext(EventContext);

  if (!ctx) {
    throw new Error("useNotify must be used within an EventProvider");
  }

  return ctx.events$.notify;
}
