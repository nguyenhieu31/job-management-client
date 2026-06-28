"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Briefcase, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/store/store"
import { GoogleAuthAction } from "@/store/slice/authentication/Authentication"
import useRouter from "@/hooks/use-router"
import { toast } from "react-toastify"

function GoogleCallbackContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage("You cancelled the Google sign-in or it was denied.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from Google.");
      return;
    }

    if (!state) {
      setStatus("error");
      setErrorMessage("No state parameter received from Google.");
      return;
    }

    const storedState = sessionStorage.getItem("googleOAuthState");
    if (storedState && storedState !== state) {
      setStatus("error");
      setErrorMessage("Security validation failed. Please try again.");
      sessionStorage.removeItem("googleOAuthState");
      return;
    }
    sessionStorage.removeItem("googleOAuthState");

    dispatch(GoogleAuthAction({ code, state }))
      .unwrap()
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard/order-service");
        }, 1500);
      })
      .catch((err: any) => {
        setStatus("error");
        setErrorMessage(err.message || "Google authentication failed. Please try again.");
        toast.error("Google authentication failed. Please try again.");
      });
  }, [dispatch, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-semibold">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <h2 className="text-xl font-semibold">Signed in successfully!</h2>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <h2 className="text-xl font-semibold">Authentication failed</h2>
      <p className="text-muted-foreground text-center max-w-sm">{errorMessage}</p>
      <div className="flex gap-4 mt-4">
        <Button variant="outline" onClick={() => router.push("/auth/login")}>
          Back to login
        </Button>
        <Button onClick={() => router.push("/auth/register")}>
          Create a new account
        </Button>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">JobManager</span>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
          }
        >
          <GoogleCallbackContent />
        </Suspense>
      </div>
    </div>
  );
}
