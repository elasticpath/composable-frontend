import React from "react"

// Utility function for combining classes (simplified version without clsx/tailwind-merge)
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "small" | "large"
  isLoading?: boolean
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-700 hover:bg-gray-100",
  }

  const sizeClasses = {
    default: "px-6 py-3 text-base",
    small: "px-4 py-2 text-sm",
    large: "px-8 py-4 text-lg",
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isLoading && "opacity-70 cursor-not-allowed",
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
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
      className={cn("w-full", className)}
      type="submit"
      isLoading={isLoading}
      {...props}
    >
      {children}
    </Button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ className = "", error = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  )
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({
  className = "",
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn("block text-sm font-medium text-gray-900 mb-2", className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({
  className = "",
  error = false,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({
  className = "",
  error = false,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-vertical",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  )
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error"
}

export function Alert({
  className = "",
  variant = "error",
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 bg-red-50 border-red-200 text-red-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
