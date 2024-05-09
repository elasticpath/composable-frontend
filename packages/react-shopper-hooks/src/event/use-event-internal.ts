import { useContext } from "react"
import { EventContext } from "./event-context"
import { StoreEvent } from "../shared/types/event-types"
import { Subject } from "./subject"

/**
 * SHOULD NOT BE USED DIRECTLY IN STORE
 *
 * This hook should only be used in providers and other hooks as it exposes the `notify` function enabling events to be
 * emitted to the event bus.
 */
export function useEventInternal(): {
  eventsSubject: Subject<StoreEvent>
} {
  const context = useContext(EventContext)

  const { events$ } = context

  return {
    eventsSubject: events$,
  }
}
