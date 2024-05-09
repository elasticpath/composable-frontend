export class Subject<TData> implements Observable<TData> {
  private observers: Observer<TData>[]

  constructor() {
    this.observers = []
  }

  subscribe(func: Observer<TData>): Subscription {
    this.observers.push(func)
    return {
      unsubscribe: () => {
        this.unsubscribe(func)
      },
    }
  }

  unsubscribe(func: Observer<TData>) {
    this.observers = this.observers.filter((observer) => observer !== func)
  }

  notify(data: TData) {
    this.observers.forEach((observer) => observer(data))
  }
}

export type Observer<TData> = (data: TData) => void

export type Observable<TData> = {
  subscribe: (observer: (data: TData) => void) => Subscription
  unsubscribe: (observer: (data: TData) => void) => void
}

export type Subscription = {
  unsubscribe(): void
}
