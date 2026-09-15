import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

// Edits a list of strings as a textarea with one item per line
const LineListInput = ({ value = [], onChange, ...props }) => {
  const [text, setText] = useState(() => value.join("\n"));

  const handleChange = (event) => {
    setText(event.target.value);
    onChange(
      event.target.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    );
  };

  return <Textarea value={text} onChange={handleChange} {...props} />;
};

export default LineListInput;
