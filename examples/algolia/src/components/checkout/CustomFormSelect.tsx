import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  SelectProps,
} from "@chakra-ui/react";
import { useField } from "formik";
import { ReactNode } from "react";

export interface ISelectField extends SelectProps {
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
    <FormControl
      isRequired={isRequired}
      isInvalid={!!meta.error && meta.touched}
    >
      <FormLabel htmlFor="email" fontSize="sm">
        {label}
      </FormLabel>
      <Select {...field} {...props}>
        {placeholder && <option>{placeholder}</option>}
        {children}
      </Select>
      {meta.error && meta.touched && (
        <FormErrorMessage>
          <>{meta.error}</>
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
