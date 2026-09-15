import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { MAX_UPLOAD_MB } from "@/lib/constants";
import LoadingButton from "./LoadingButton";

// Button that opens the file picker and passes the chosen file to onSelect
const FileUpload = ({ id, accept, onSelect, loading, label = "Upload file", hint, variant = "outline", icon: Icon = Upload }) => {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    // reset so choosing the same file again still triggers a change
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast.error(`File is too large. The maximum size is ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    onSelect(file);
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <input ref={inputRef} id={id} type="file" accept={accept} className="sr-only" onChange={handleChange} tabIndex={-1} />
      <LoadingButton type="button" variant={variant} loading={loading} onClick={() => inputRef.current?.click()}>
        {!loading && <Icon />}
        {label}
      </LoadingButton>
      {hint && <p className="type-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};

export default FileUpload;
