"use client"

import { useContext } from "react"
import { EventContext } from "./event-context"
import { StoreEvent } from "../shared"
import { Observable } from "./subject"

/**
 * Should be used to access the event stream and subscribe to events in the store.
 */
export function useEvent(): { events: Observable<StoreEvent> } {
  const { events$ } = useContext(EventContext)

  return {
    events: events$,
  }
}
