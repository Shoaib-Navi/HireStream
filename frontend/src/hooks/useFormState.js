import { useCallback, useState } from "react";
import { getFieldErrors } from "@/lib/errors";

// Small form helper: values, per-field errors (from the API's validation response) and change handlers
export const useFormState = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const { [name]: _removed, ...rest } = previous;
      return rest;
    });
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      setField(name, type === "checkbox" ? checked : value);
    },
    [setField],
  );

  const setServerErrors = useCallback((error) => setErrors(getFieldErrors(error)), []);

  return { values, errors, setValues, setField, handleChange, setErrors, setServerErrors };
};
