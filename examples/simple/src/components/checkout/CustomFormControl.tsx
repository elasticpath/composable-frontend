import { useField } from "formik";
import clsx from "clsx";

interface ITextField {
  id: string;
  type: string;
  label: string;
  name: string;
  autoComplete: string;
  isRequired?: boolean;
  helperText?: string;
}

export default function CustomFormControl({
  label,
  isRequired = false,
  helperText,
  ...props
}: ITextField): JSX.Element {
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
      <input
        className={clsx(
          meta.touched && meta.error && "border-red-600",
          "h-10 rounded-md border px-4 py-2",
        )}
        {...field}
        {...props}
      ></input>
      {helperText && <span className="text-sm">{helperText}</span>}
      {meta.touched && meta.error ? (
        <span className="text-sm text-red-600">{meta.error}</span>
      ) : null}
    </div>
  );
}
