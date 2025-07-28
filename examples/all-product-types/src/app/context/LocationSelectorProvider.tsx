"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react"
import type { Location } from "@epcc-sdk/sdks-shopper"

interface LocationSelectorContextType {
  selectedLocation: Location | undefined
  setSelectedLocation: Dispatch<SetStateAction<Location | undefined>>
  locations: Location[]
  setLocations: Dispatch<SetStateAction<Location[]>>
}

const LocationSelectorContext = createContext<
  LocationSelectorContextType | undefined
>(undefined)

interface LocationSelectorProviderProps {
  children: ReactNode
  initialLocations?: Location[]
  initialSelectedLocation?: Location
}

export function LocationSelectorProvider({
  children,
  initialLocations = [],
  initialSelectedLocation,
}: LocationSelectorProviderProps) {
  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(initialSelectedLocation)
  const [locations, setLocations] = useState<Location[]>(initialLocations)

  return (
    <LocationSelectorContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        locations,
        setLocations,
      }}
    >
      {children}
    </LocationSelectorContext.Provider>
  )
}

export function useLocationSelector() {
  const context = useContext(LocationSelectorContext)
  if (context === undefined) {
    throw new Error(
      "useLocationSelector must be used within a LocationSelectorProvider",
    )
  }
  return context
}
