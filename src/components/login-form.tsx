"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ComponentProps, type FormEvent } from "react"

import { getAfterAuthRedirect } from "~/lib/auth/routing"
import { normalizeAuthErrorMessage } from "~/lib/auth/forms"
import { cn } from "~/lib/utils"
import { authClient } from "~/server/better-auth/client"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

export function LoginForm({
  className,
  nextPath,
  ...props
}: ComponentProps<"div"> & {
  nextPath?: string | null
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const signupHref = nextPath
    ? `/signup?next=${encodeURIComponent(nextPath)}`
    : "/signup"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const emailValue = formData.get("email")
    const passwordValue = formData.get("password")
    const email = (typeof emailValue === "string" ? emailValue : "").trim()
    const password = typeof passwordValue === "string" ? passwordValue : ""

    setError(null)
    setIsPending(true)

    try {
      await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          throw: true,
        },
      })

      router.replace(getAfterAuthRedirect(nextPath))
      router.refresh()
    } catch (authError) {
      setError(normalizeAuthErrorMessage(authError))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  aria-invalid={!!error}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  disabled={isPending}
                  required
                />
              </Field>
              <FieldError>{error}</FieldError>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href={signupHref}>
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to the terms and privacy policy for this app.
      </FieldDescription>
    </div>
  )
}
