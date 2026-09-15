import { useEffect, useRef } from "react";
import { CheckCircle2, MailX } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { getDashboardHome } from "@/config/navigation";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/errors";
import { useVerifyEmailMutation } from "../api";
import { useAuth } from "../hooks/useAuth";

// Opened from the link in the verification email, signed in or not
const VerifyEmailPage = () => {
  useDocumentTitle("Verify email");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { user } = useAuth();
  const [verifyEmail, { isSuccess, isError, error }] = useVerifyEmailMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !token) return;
    attempted.current = true;
    verifyEmail(token);
  }, [token, verifyEmail]);

  const renderState = () => {
    if (!token || isError) {
      return {
        icon: MailX,
        title: "This link didn't work",
        description: token
          ? getErrorMessage(error)
          : "The link looks incomplete. Open it again from your email, or sign in and request a new one.",
        action: (
          <Button asChild variant="outline">
            <Link to={user ? `${getDashboardHome(user.role)}` : "/login"}>{user ? "Go to dashboard" : "Log in"}</Link>
          </Button>
        ),
      };
    }
    if (isSuccess) {
      return {
        icon: CheckCircle2,
        title: "Your email is verified",
        description: "Thanks! You can now apply to jobs and receive updates about your applications.",
        action: (
          <Button asChild>
            <Link to={user ? getDashboardHome(user.role) : "/login"}>{user ? "Go to dashboard" : "Log in"}</Link>
          </Button>
        ),
      };
    }
    return { title: "Verifying your email…", description: "This only takes a moment." };
  };

  const { icon: Icon, title, description, action } = renderState();

  return (
    <div className="page-container flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-xl border bg-card px-6 py-12 text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-md border bg-surface text-foreground">
          {Icon ? <Icon className="size-5" aria-hidden="true" /> : <Spinner />}
        </div>
        <h1 className="type-h2 text-foreground">{title}</h1>
        <p className="type-body mt-2 text-muted-foreground">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
