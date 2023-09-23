import clsx from "clsx";
import { useField } from "formik";
import { ReactNode } from "react";

export interface ISelectField {
  id: string;
  name: string;
  autoComplete: string;
  label: string;
  isRequired?: boolean;
  placeholder?: string;
  children: ReactNode[];
}

export default function CustomFormSelect({
  label,
  isRequired = false,
  children,
  placeholder,
  ...props
}: ISelectField): JSX.Element {
  const [field, meta] = useField(props as any);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="email" className="flex text-sm font-medium">
        {label}
        <span
          className={clsx(isRequired ? "block" : "hidden", "ml-1 text-red-600")}
        >
          *
        </span>
      </label>
      <select
        {...field}
        {...props}
        className={clsx(
          meta.touched && meta.error && "border-red-600",
          "h-10 rounded-md border px-4 py-2",
        )}
      >
        {placeholder && <option>{placeholder}</option>}
        {children}
      </select>
      {meta.touched && meta.error ? (
        <span className="text-sm text-red-600">{meta.error}</span>
      ) : null}
    </div>
  );
}
