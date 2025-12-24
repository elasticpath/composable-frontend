"use client";

import { createContext, ReactNode } from "react";
import { StoreEvent } from "./event-types";
import { Subject } from "./subject";

export const _eventBus$ = new Subject<StoreEvent>();

export type EventContextType = {
  events$: Subject<StoreEvent>;
};

export const EventContext = createContext<EventContextType | null>(null);

export function Events({
  bus,
  ...props
}: {
  children: ReactNode;
  bus?: Subject<StoreEvent>;
}) {
  return (
    <EventContext.Provider value={{ events$: bus ?? _eventBus$ }} {...props} />
  );
}
