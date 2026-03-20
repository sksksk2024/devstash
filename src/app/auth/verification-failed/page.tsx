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

function getErrorMessage(error: string | null) {
  switch (error) {
    case "missing-token":
      return "The verification link is missing required information.";
    case "invalid-token":
      return "The verification token is invalid or has already been used.";
    case "expired-token":
      return "The verification link has expired. Please request a new one.";
    case "user-not-found":
      return "The user associated with this verification link was not found.";
    case "server-error":
      return "An unexpected error occurred. Please try again later.";
    default:
      return "Email verification failed. Please try again.";
  }
}

export default function VerificationFailedPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || null;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Failed
          </CardTitle>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Please try again or contact support if the problem persists.</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Try Registering Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
