import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerificationSuccessContent({
  alreadyVerified,
}: {
  alreadyVerified: boolean;
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">
            {alreadyVerified ? "Already Verified" : "Email Verified!"}
          </CardTitle>
          <CardDescription>
            {alreadyVerified
              ? "Your email has already been verified."
              : "Your email address has been successfully verified."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {alreadyVerified ? (
            <p>You can continue to sign in to your account.</p>
          ) : (
            <p>You can now sign in to your account.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerificationSuccessPage({
  searchParams,
}: {
  searchParams: { alreadyVerified?: string };
}) {
  const alreadyVerified = searchParams.alreadyVerified === "true";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationSuccessContent alreadyVerified={alreadyVerified} />
    </Suspense>
  );
}
