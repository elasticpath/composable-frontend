import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  isLoading?: boolean
}

export function Button({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        isLoading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  )
}

interface FormStatusButtonProps extends ButtonProps {}

export function FormStatusButton({
  children,
  className = "",
  isLoading = false,
  ...props
}: FormStatusButtonProps) {
  return (
    <Button
      className={`w-full ${className}`}
      type="submit"
      isLoading={isLoading}
      {...props}
    >
      {children}
    </Button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 ${className}`}
      {...props}
    />
  )
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium leading-6 text-gray-900 ${className}`}
      {...props}
    />
  )
}
