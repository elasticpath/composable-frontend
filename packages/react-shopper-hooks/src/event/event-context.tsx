"use client"

import { createContext } from "react"
import { StoreEvent } from "../shared/types/event-types"
import { Subject } from "./subject"

export const _eventBus$ = new Subject<StoreEvent>()

export function emitter(event: StoreEvent): void {
  _eventBus$.notify(event)
}

export const EventContext = createContext<{
  events$: Subject<StoreEvent>
}>({ events$: _eventBus$ })
