import { useContext } from "react"
import { EventContext } from "./event-context"
import { Subject } from "rxjs"
import { StoreEvent } from "../shared/types/event-types"

/**
 * SHOULD NOT BE USED DIRECTLY IN STORE
 *
 * This hook should only be used in providers and other hooks as it exposes the `emit` function enabling events to be
 * emitted to the event bus.
 *
 * Exposes the events$ observable as a Subject instead of its raw BehaviourSubject. Limits the potential that
 * internal use will depend on the streams current value.
 */
export function useEventInternal(): {
  eventsSubject: Subject<StoreEvent>
  emit: (event: StoreEvent) => void
} {
  const context = useContext(EventContext)

  const { events$ } = context

  return {
    eventsSubject: events$,
    emit: (event) => events$.next(event),
  }
}
