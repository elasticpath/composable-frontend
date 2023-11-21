import { createContext } from "react"
import { Subject } from "rxjs"
import { StoreEvent } from "../shared/types/event-types"

const _eventBus$ = new Subject<StoreEvent>()

export function emitter(event: StoreEvent): void {
  _eventBus$.next(event)
}

export const EventContext = createContext<{
  events$: Subject<StoreEvent>
}>({ events$: new Subject<StoreEvent>() })
