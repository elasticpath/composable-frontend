import { useContext } from "react"
import { EventContext } from "./event-context"
import { Subscribable } from "@lib/event/types/observe"
import { StoreEvent } from "@lib/shared"

/**
 * Should be used to access the event stream and subscribe to events in the store.
 */
export function useEvent(): { events: Subscribable<StoreEvent> } {
  const { events$ } = useContext(EventContext)

  return {
    events: events$.asObservable(),
  }
}
