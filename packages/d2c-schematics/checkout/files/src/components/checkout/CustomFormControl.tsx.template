import { useField } from "formik";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputProps,
} from "@chakra-ui/react";

interface ITextField extends InputProps {
  label: string;
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
    <FormControl
      isRequired={isRequired}
      isInvalid={!!meta.error && meta.touched}
    >
      <FormLabel htmlFor="email" fontSize="sm">
        {label}
      </FormLabel>
      <Input {...field} {...props} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {meta.error && meta.touched && (
        <FormErrorMessage>
          <>{meta.error}</>
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
