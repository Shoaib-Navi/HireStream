import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Button that shows a spinner and blocks repeat clicks while an action is running
const LoadingButton = ({ loading = false, loadingText, disabled, children, ...props }) => (
  <Button disabled={loading || disabled} aria-busy={loading || undefined} {...props}>
    {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
    {loading && loadingText ? loadingText : children}
  </Button>
);

export default LoadingButton;
