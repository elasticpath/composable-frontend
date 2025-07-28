"use client"

import React from "react"
import { cn } from "../../../lib/cn"

export interface StatusButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: "idle" | "loading" | "success" | "error"
  children: React.ReactNode
}

export const StatusButton = React.forwardRef<
  HTMLButtonElement,
  StatusButtonProps
>(({ className, status, children, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "w-full rounded-md px-4 py-2 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        {
          "bg-blue-600 hover:bg-blue-700": status === "idle" && !disabled,
          "bg-blue-600 opacity-75 cursor-not-allowed": status === "loading",
          "bg-green-600": status === "success",
          "bg-red-600": status === "error",
          "bg-gray-400 cursor-not-allowed": disabled && status === "idle",
        },
        className,
      )}
      disabled={disabled || status === "loading"}
      {...props}
    >
      {status === "loading" ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
})

StatusButton.displayName = "StatusButton"