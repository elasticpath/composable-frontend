// Taken from RxJS
export interface Observer<T> {
  next: (value: T) => void
  error: (err: any) => void
  complete: () => void
}

export interface Subscription {
  unsubscribe(): void
}

export interface InteropObservable<T> {
  [Symbol.observable]: () => InteropSubscribable<T>
}

export interface InteropSubscribable<T> {
  subscribe(observer: Observer<T>): Subscription
}

export interface Subscribable<T> extends InteropSubscribable<T> {
  subscribe(observer: Observer<T>): Subscription
  subscribe(
    next: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription
}
